"""
Automated Client Onboarding Engine — API
=========================================

Multi-tenant FastAPI backend for RIA client onboarding:

  1. Clients submit contact details + a PDF statement through a white-labeled
     portal (/onboard/{advisor_id} on the frontend).
  2. The statement is parsed by Gemini into a strict Pydantic schema, with a
     per-field confidence score and server-side sanity checks.
  3. The submission is stored in Supabase.
  4. A signed webhook is dispatched in the background to the advisor's
     Zapier / Make endpoint, which creates the contact in Wealthbox / Redtail.

Run:  uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import ipaddress
import json
import logging
import os
import re
import socket
import time
import uuid
from datetime import datetime, timezone
from io import BytesIO
from typing import Any, Literal
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv
from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    File,
    Form,
    Header,
    HTTPException,
    UploadFile,
)
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from pypdf import PdfReader

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("onboarding-engine")

# --------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Comma-separated list. Tighten this before going live — "*" is dev only.
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]

# Protects advisor-configuration endpoints until real auth (Task 3) lands.
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")

# Where advisors review submissions (used to build deep links in webhook payloads).
PORTAL_BASE_URL = os.getenv("PORTAL_BASE_URL", "http://localhost:5173").rstrip("/")

# Fallback tenant so the demo works before the `advisors` table is populated.
DEMO_ADVISOR_ID = os.getenv("DEMO_ADVISOR_ID", "demo")
DEMO_FIRM_NAME = os.getenv("DEMO_FIRM_NAME", "Summit Ridge Wealth Partners")
DEMO_WEBHOOK_URL = os.getenv("DEMO_WEBHOOK_URL")  # e.g. https://hooks.zapier.com/hooks/catch/...
DEMO_WEBHOOK_SECRET = os.getenv("DEMO_WEBHOOK_SECRET")

# "on_extract": fire webhook as soon as parsing succeeds (Task 1 default).
# "on_approve": hold until an advisor approves in the review dashboard (Task 3).
DEFAULT_DISPATCH_MODE = os.getenv("WEBHOOK_DISPATCH_MODE", "on_extract")

# Dev-only escape hatch: allow http:// and private-network webhook targets.
ALLOW_INSECURE_WEBHOOKS = os.getenv("ALLOW_INSECURE_WEBHOOKS", "false").lower() == "true"

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "15")) * 1024 * 1024
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.80"))
WEBHOOK_TIMEOUT_SECONDS = 10.0
WEBHOOK_MAX_ATTEMPTS = 4

FINANCIAL_FIELDS = ("institution_name", "total_assets", "liquid_cash", "monthly_income", "account_type")

# --------------------------------------------------------------------------
# Clients (both optional so the API still boots in a half-configured env)
# --------------------------------------------------------------------------

gemini_client: genai.Client | None = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client

        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as exc:  # pragma: no cover - depends on env
        log.warning("Supabase client unavailable: %s", exc)

# --------------------------------------------------------------------------
# Schemas
# --------------------------------------------------------------------------


class FieldConfidence(BaseModel):
    institution_name: float = Field(description="0.0-1.0 confidence that institution_name is correct")
    total_assets: float = Field(description="0.0-1.0 confidence that total_assets is correct")
    liquid_cash: float = Field(description="0.0-1.0 confidence that liquid_cash is correct")
    monthly_income: float = Field(description="0.0-1.0 confidence that monthly_income is correct")
    account_type: float = Field(description="0.0-1.0 confidence that account_type is correct")


class FinancialStatementSchema(BaseModel):
    institution_name: str
    total_assets: float
    liquid_cash: float
    monthly_income: float
    account_type: str
    confidence: FieldConfidence


class ContactInfo(BaseModel):
    full_name: str
    first_name: str
    last_name: str
    email: str
    phone: str


class AdvisorConfig(BaseModel):
    advisor_id: str
    firm_name: str
    logo_url: str | None = None
    brand_color: str = "#1e3a5f"
    welcome_message: str | None = None
    webhook_url: str | None = None
    webhook_secret: str | None = None
    dispatch_mode: Literal["on_extract", "on_approve"] = "on_extract"


class AdvisorPublicProfile(BaseModel):
    """The only advisor data ever exposed to the public intake portal."""

    advisor_id: str
    firm_name: str
    logo_url: str | None = None
    brand_color: str
    welcome_message: str | None = None


class WebhookSettings(BaseModel):
    webhook_url: str
    webhook_secret: str | None = None
    dispatch_mode: Literal["on_extract", "on_approve"] = "on_extract"


# --------------------------------------------------------------------------
# App
# --------------------------------------------------------------------------

app = FastAPI(title="Automated Client Onboarding Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=ALLOWED_ORIGINS != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def require_admin(x_admin_key: str | None = Header(default=None)) -> None:
    if not ADMIN_API_KEY:
        raise HTTPException(503, "ADMIN_API_KEY is not configured on the server.")
    if not x_admin_key or not hmac.compare_digest(x_admin_key, ADMIN_API_KEY):
        raise HTTPException(401, "Invalid admin key.")


# --------------------------------------------------------------------------
# Tenant (advisor) lookup
# --------------------------------------------------------------------------

ADVISOR_ID_RE = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")


def _load_advisor_sync(advisor_id: str) -> AdvisorConfig | None:
    if supabase is not None:
        try:
            res = supabase.table("advisors").select("*").eq("advisor_id", advisor_id).limit(1).execute()
            if res.data:
                return AdvisorConfig(**res.data[0])
        except Exception as exc:
            log.warning("Advisor lookup failed for %s: %s", advisor_id, exc)

    if advisor_id == DEMO_ADVISOR_ID:
        return AdvisorConfig(
            advisor_id=DEMO_ADVISOR_ID,
            firm_name=DEMO_FIRM_NAME,
            welcome_message="Securely share your latest statement so we can prepare for your first planning meeting.",
            webhook_url=DEMO_WEBHOOK_URL,
            webhook_secret=DEMO_WEBHOOK_SECRET,
            dispatch_mode=DEFAULT_DISPATCH_MODE if DEFAULT_DISPATCH_MODE in ("on_extract", "on_approve") else "on_extract",
        )
    return None


async def get_advisor_or_404(advisor_id: str) -> AdvisorConfig:
    if not ADVISOR_ID_RE.match(advisor_id):
        raise HTTPException(404, "Advisor not found.")
    advisor = await run_in_threadpool(_load_advisor_sync, advisor_id)
    if advisor is None:
        raise HTTPException(404, "Advisor not found.")
    return advisor


# --------------------------------------------------------------------------
# Input validation
# --------------------------------------------------------------------------

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")


def validate_contact(full_name: str, email: str, phone: str) -> ContactInfo:
    full_name = " ".join(full_name.split())
    email = email.strip().lower()
    digits = re.sub(r"\D", "", phone)

    if len(full_name) < 2 or len(full_name) > 120:
        raise HTTPException(422, "Please provide your full name.")
    if not EMAIL_RE.match(email) or len(email) > 254:
        raise HTTPException(422, "Please provide a valid email address.")
    if not 10 <= len(digits) <= 15:
        raise HTTPException(422, "Please provide a valid phone number.")

    # E.164-ish: assume US/Canada when 10 digits are given.
    normalized_phone = f"+1{digits}" if len(digits) == 10 else f"+{digits}"
    first, _, last = full_name.partition(" ")
    return ContactInfo(full_name=full_name, first_name=first, last_name=last, email=email, phone=normalized_phone)


async def read_pdf_upload(file: UploadFile) -> bytes:
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, f"File exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit.")
    if not data.startswith(b"%PDF"):
        raise HTTPException(415, "Please upload a PDF statement.")
    return data


# --------------------------------------------------------------------------
# Extraction
# --------------------------------------------------------------------------

EXTRACTION_PROMPT = """You are a meticulous financial-operations analyst at a Registered Investment Advisor.
Extract the following from the client's financial statement:

- institution_name: the custodian / bank / brokerage that issued the statement.
- total_assets: total account value or ending balance at the statement date (USD).
- liquid_cash: cash, sweep, and money-market balances (USD).
- monthly_income: income, dividends, interest, or deposits attributable to one month (USD).
  If only a quarterly/annual figure is shown, convert it to a monthly figure.
- account_type: e.g. "Individual Brokerage", "Roth IRA", "Traditional IRA", "401(k)", "Joint", "Trust", "Checking".

Rules:
- Use 0 for any numeric value that is genuinely not present, and give it a low confidence.
- Numbers must be plain floats (no currency symbols or commas).
- For each field, give a confidence between 0.0 and 1.0 reflecting how clearly the statement supports the value.
  Inferred, computed, or ambiguous values must score below 0.8.
"""


def _pdf_to_text(pdf_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(pdf_bytes))
    return "\n".join((page.extract_text() or "") for page in reader.pages).strip()


async def extract_financials(pdf_bytes: bytes) -> FinancialStatementSchema:
    if gemini_client is None:
        raise HTTPException(503, "GEMINI_API_KEY is not configured on the server.")

    try:
        text = await run_in_threadpool(_pdf_to_text, pdf_bytes)
    except Exception as exc:
        log.warning("pypdf failed, falling back to native PDF input: %s", exc)
        text = ""

    # Scanned / image-only statements have no text layer — let Gemini read the PDF directly.
    if len(text) >= 50:
        contents: list[Any] = [EXTRACTION_PROMPT, f"STATEMENT TEXT:\n{text[:120_000]}"]
    else:
        contents = [EXTRACTION_PROMPT, types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")]

    try:
        response = await gemini_client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=FinancialStatementSchema,
                temperature=0.0,
            ),
        )
    except Exception as exc:
        log.exception("Gemini extraction failed")
        raise HTTPException(502, "We couldn't read that statement. Please try again or upload a different file.") from exc

    parsed = response.parsed
    if isinstance(parsed, FinancialStatementSchema):
        return parsed
    try:
        return FinancialStatementSchema.model_validate_json(response.text or "")
    except Exception as exc:
        log.error("Unparseable Gemini response: %r", (response.text or "")[:500])
        raise HTTPException(502, "Statement parsing returned an unexpected format.") from exc


def compute_review_flags(data: FinancialStatementSchema) -> dict[str, list[str]]:
    """Field -> reasons. Anything in here is highlighted in the HITL review view."""
    flags: dict[str, list[str]] = {}

    def flag(field: str, reason: str) -> None:
        flags.setdefault(field, []).append(reason)

    for field in FINANCIAL_FIELDS:
        score = getattr(data.confidence, field)
        if score < CONFIDENCE_THRESHOLD:
            flag(field, f"Low model confidence ({score:.0%})")

    for field in ("total_assets", "liquid_cash", "monthly_income"):
        if getattr(data, field) < 0:
            flag(field, "Negative value")
    if data.total_assets == 0:
        flag("total_assets", "Total assets reported as $0")
    if data.liquid_cash > data.total_assets > 0:
        flag("liquid_cash", "Liquid cash exceeds total assets")
    if not data.institution_name.strip():
        flag("institution_name", "Institution not identified")

    return flags


# --------------------------------------------------------------------------
# Persistence (best effort — the client experience never fails on DB errors)
# --------------------------------------------------------------------------


def _insert_sync(table: str, row: dict[str, Any]) -> bool:
    if supabase is None:
        return False
    try:
        supabase.table(table).insert(row).execute()
        return True
    except Exception as exc:
        log.warning("Supabase insert into %s failed: %s", table, exc)
        return False


def _update_sync(table: str, match: dict[str, Any], values: dict[str, Any]) -> bool:
    if supabase is None:
        return False
    try:
        query = supabase.table(table).update(values)
        for key, value in match.items():
            query = query.eq(key, value)
        query.execute()
        return True
    except Exception as exc:
        log.warning("Supabase update on %s failed: %s", table, exc)
        return False


# --------------------------------------------------------------------------
# Webhook dispatcher (Zapier / Make -> Wealthbox / Redtail)
# --------------------------------------------------------------------------


def validate_webhook_url(url: str) -> None:
    """Block SSRF: only public HTTPS endpoints unless explicitly running in dev mode."""
    parsed = urlparse(url)
    if parsed.scheme not in ("https", "http") or not parsed.hostname:
        raise HTTPException(422, "Webhook URL must be an absolute http(s) URL.")
    if ALLOW_INSECURE_WEBHOOKS:
        return
    if parsed.scheme != "https":
        raise HTTPException(422, "Webhook URL must use HTTPS.")
    try:
        infos = socket.getaddrinfo(parsed.hostname, parsed.port or 443, proto=socket.IPPROTO_TCP)
    except socket.gaierror as exc:
        raise HTTPException(422, "Webhook host could not be resolved.") from exc
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if not ip.is_global:
            raise HTTPException(422, "Webhook URL must point to a public host.")


def sign_payload(secret: str, timestamp: str, body: bytes) -> str:
    mac = hmac.new(secret.encode(), f"{timestamp}.".encode() + body, hashlib.sha256).hexdigest()
    return f"t={timestamp},v1={mac}"


def build_crm_payload(
    *,
    event: str,
    advisor: AdvisorConfig,
    submission_id: str,
    contact: ContactInfo,
    financials: dict[str, Any],
    flags: dict[str, list[str]],
    review_status: str,
) -> dict[str, Any]:
    """
    Flat, Zapier/Make-friendly shape: every CRM field is a top-level key so it
    can be mapped straight onto Wealthbox "Create Contact" or Redtail
    "Create Contact" actions without a Formatter step.
    """
    return {
        "event": event,
        "event_id": str(uuid.uuid4()),
        "occurred_at": utcnow_iso(),
        "advisor_id": advisor.advisor_id,
        "firm_name": advisor.firm_name,
        "submission_id": submission_id,
        "review_status": review_status,
        "review_url": f"{PORTAL_BASE_URL}/review/{submission_id}",
        # Contact
        "client_full_name": contact.full_name,
        "client_first_name": contact.first_name,
        "client_last_name": contact.last_name,
        "client_email": contact.email,
        "client_phone": contact.phone,
        # Financials
        "institution_name": financials["institution_name"],
        "account_type": financials["account_type"],
        "total_assets": financials["total_assets"],
        "liquid_cash": financials["liquid_cash"],
        "monthly_income": financials["monthly_income"],
        # Review metadata
        "needs_review": bool(flags),
        "flagged_fields": ", ".join(sorted(flags)),  # string: easy to drop into a CRM note
        "crm_note": _crm_note(contact, financials, flags),
    }


def _crm_note(contact: ContactInfo, fin: dict[str, Any], flags: dict[str, list[str]]) -> str:
    lines = [
        f"Onboarding statement received from {contact.full_name}.",
        f"Institution: {fin['institution_name']} ({fin['account_type']})",
        f"Total assets: ${fin['total_assets']:,.2f}",
        f"Liquid cash: ${fin['liquid_cash']:,.2f}",
        f"Monthly income: ${fin['monthly_income']:,.2f}",
    ]
    if flags:
        lines.append("Needs review: " + "; ".join(f"{k}: {', '.join(v)}" for k, v in sorted(flags.items())))
    return "\n".join(lines)


class _DeliveryResult(BaseModel):
    status_code: int | None
    attempts: int
    message: str | None


async def _post_with_retries(url: str, body: bytes, headers: dict[str, str], secret: str | None) -> _DeliveryResult:
    status_code: int | None = None
    error: str | None = None
    attempt = 0
    async with httpx.AsyncClient(timeout=WEBHOOK_TIMEOUT_SECONDS, follow_redirects=False) as client:
        for attempt in range(1, WEBHOOK_MAX_ATTEMPTS + 1):
            if secret:
                # Re-sign each attempt so receivers can enforce a freshness window.
                headers["X-Onboarding-Signature"] = sign_payload(secret, str(int(time.time())), body)
            try:
                resp = await client.post(url, content=body, headers=headers)
                status_code, error = resp.status_code, None
                if 200 <= resp.status_code < 300:
                    break
                error = f"HTTP {resp.status_code}: {resp.text[:300]}"
                if resp.status_code != 429 and resp.status_code < 500:
                    break  # permanent failure (bad URL, auth) — don't hammer it
            except httpx.HTTPError as exc:
                status_code, error = None, f"{type(exc).__name__}: {exc}"
            if attempt < WEBHOOK_MAX_ATTEMPTS:
                await asyncio.sleep(2 ** (attempt - 1))
    return _DeliveryResult(status_code=status_code, attempts=attempt, message=error)


async def dispatch_webhook(url: str, secret: str | None, payload: dict[str, Any]) -> bool:
    """POST with HMAC signature, retrying 429/5xx/network errors with exponential backoff."""
    body = json.dumps(payload, separators=(",", ":"), default=str).encode()
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "OnboardingEngine-Webhooks/2.0",
        "X-Onboarding-Event": payload["event"],
        "X-Idempotency-Key": payload["event_id"],
    }

    status_code: int | None = None
    error: str | None = None
    attempt = 0
    try:
        await run_in_threadpool(validate_webhook_url, url)
    except HTTPException as exc:
        error = f"Rejected target URL: {exc.detail}"
    else:
        result = await _post_with_retries(url, body, headers, secret)
        status_code, attempt, error = result.status_code, result.attempts, result.message

    delivered = error is None
    log.info(
        "Webhook %s for submission %s -> %s (attempts=%d, status=%s)",
        payload["event"], payload.get("submission_id"), "delivered" if delivered else "FAILED", attempt, status_code,
    )

    await run_in_threadpool(
        _insert_sync,
        "webhook_deliveries",
        {
            "event_id": payload["event_id"],
            "submission_id": payload.get("submission_id"),
            "advisor_id": payload.get("advisor_id"),
            "event": payload["event"],
            "target_url": url,
            "attempts": attempt,
            "status_code": status_code,
            "delivered": delivered,
            "error": error,
            "payload": payload,
        },
    )
    if payload.get("submission_id"):
        await run_in_threadpool(
            _update_sync,
            "client_submissions",
            {"id": payload["submission_id"]},
            {"crm_sync_status": "synced" if delivered else "failed", "crm_synced_at": utcnow_iso() if delivered else None},
        )
    return delivered


# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "gemini_configured": gemini_client is not None,
        "supabase_configured": supabase is not None,
        "model": GEMINI_MODEL,
    }


@app.get("/advisors/{advisor_id}/public", response_model=AdvisorPublicProfile)
async def advisor_public_profile(advisor_id: str) -> AdvisorPublicProfile:
    """Branding for the white-labeled portal. Never exposes webhook config."""
    advisor = await get_advisor_or_404(advisor_id)
    return AdvisorPublicProfile(**advisor.model_dump(include=set(AdvisorPublicProfile.model_fields)))


@app.post("/onboard/{advisor_id}/submit")
async def submit_onboarding(
    advisor_id: str,
    background_tasks: BackgroundTasks,
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    consent: bool = Form(...),
    file: UploadFile = File(...),
) -> dict[str, Any]:
    """Client-facing intake: contact info + statement -> parse -> store -> CRM webhook."""
    advisor = await get_advisor_or_404(advisor_id)
    if not consent:
        raise HTTPException(422, "Consent is required to share your statement with your advisor.")
    contact = validate_contact(full_name, email, phone)
    pdf_bytes = await read_pdf_upload(file)

    extracted = await extract_financials(pdf_bytes)
    flags = compute_review_flags(extracted)
    financials = extracted.model_dump(exclude={"confidence"})
    submission_id = str(uuid.uuid4())
    review_status = "needs_review" if flags else "pending_review"

    will_dispatch = bool(advisor.webhook_url) and advisor.dispatch_mode == "on_extract"

    stored = await run_in_threadpool(
        _insert_sync,
        "client_submissions",
        {
            "id": submission_id,
            "advisor_id": advisor.advisor_id,
            **contact.model_dump(),
            **financials,
            "confidence": extracted.confidence.model_dump(),
            "flags": flags,
            "original_extraction": extracted.model_dump(),
            "review_status": review_status,
            "crm_sync_status": "queued" if will_dispatch else "not_sent",
            "source_filename": (file.filename or "statement.pdf")[:255],
        },
    )

    if will_dispatch:
        payload = build_crm_payload(
            event="client.statement_parsed",
            advisor=advisor,
            submission_id=submission_id,
            contact=contact,
            financials=financials,
            flags=flags,
            review_status=review_status,
        )
        background_tasks.add_task(dispatch_webhook, advisor.webhook_url, advisor.webhook_secret, payload)

    # Client-facing response: confirmation only. Parsed figures are for the advisor's eyes
    # (and HITL review) — clients shouldn't see potentially wrong numbers.
    return {
        "status": "received",
        "submission_id": submission_id,
        "reference": submission_id.split("-")[0].upper(),
        "firm_name": advisor.firm_name,
        "stored": stored,
    }


@app.post("/extract-statement")
async def extract_statement(background_tasks: BackgroundTasks, file: UploadFile = File(...)) -> dict[str, Any]:
    """Legacy internal endpoint (v1 dashboard). Kept for backwards compatibility."""
    pdf_bytes = await read_pdf_upload(file)
    extracted = await extract_financials(pdf_bytes)
    financials = extracted.model_dump(exclude={"confidence"})
    flags = compute_review_flags(extracted)

    background_tasks.add_task(_insert_sync, "financial_summaries", financials)

    return {**financials, "confidence": extracted.confidence.model_dump(), "flags": flags}


# ---- Advisor webhook configuration (admin-key protected) -------------------


@app.put("/advisors/{advisor_id}/webhook", dependencies=[Depends(require_admin)])
async def configure_webhook(advisor_id: str, settings: WebhookSettings) -> dict[str, Any]:
    await get_advisor_or_404(advisor_id)
    validate_webhook_url(settings.webhook_url)
    ok = await run_in_threadpool(
        _update_sync, "advisors", {"advisor_id": advisor_id}, settings.model_dump(exclude_none=True)
    )
    if not ok:
        raise HTTPException(500, "Could not save webhook settings (is Supabase configured?).")
    return {"status": "saved", "advisor_id": advisor_id, "dispatch_mode": settings.dispatch_mode}


@app.post("/advisors/{advisor_id}/webhook/test", dependencies=[Depends(require_admin)])
async def test_webhook(advisor_id: str) -> dict[str, Any]:
    """Sends a sample payload so the advisor can map fields in Zapier / Make."""
    advisor = await get_advisor_or_404(advisor_id)
    if not advisor.webhook_url:
        raise HTTPException(400, "No webhook URL configured for this advisor.")
    validate_webhook_url(advisor.webhook_url)

    payload = build_crm_payload(
        event="webhook.test",
        advisor=advisor,
        submission_id="",
        contact=ContactInfo(
            full_name="Jane Sample", first_name="Jane", last_name="Sample",
            email="jane.sample@example.com", phone="+15555550123",
        ),
        financials={
            "institution_name": "Vanguard", "account_type": "Individual Brokerage",
            "total_assets": 482_750.12, "liquid_cash": 38_200.00, "monthly_income": 1_845.33,
        },
        flags={},
        review_status="test",
    )
    delivered = await dispatch_webhook(advisor.webhook_url, advisor.webhook_secret, payload)
    return {"delivered": delivered, "payload": payload}
