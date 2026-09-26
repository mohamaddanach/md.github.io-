# Automated Client Onboarding Engine

White-labeled client intake → AI statement parsing → CRM sync (Wealthbox / Redtail via Zapier or Make).

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env            # fill in keys
# Run supabase/schema.sql in the Supabase SQL editor
uvicorn main:app --reload --port 8000

cd frontend
npm install --ignore-scripts react-router-dom
npm run dev                     # http://localhost:5173/onboard/demo
```

## Connect a CRM (Zapier)

1. Zapier → **Webhooks by Zapier → Catch Hook** → copy the URL.
2. Save it for the advisor:
   ```bash
   curl -X PUT localhost:8000/advisors/demo/webhook -H "X-Admin-Key: $ADMIN_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"webhook_url":"https://hooks.zapier.com/hooks/catch/...","webhook_secret":"<random>"}'
   ```
   (or set `DEMO_WEBHOOK_URL` in `.env` for the demo tenant)
3. `curl -X POST localhost:8000/advisors/demo/webhook/test -H "X-Admin-Key: $ADMIN_API_KEY"` sends a sample payload so Zapier can see every field.
4. Add action **Wealthbox → Create Contact** (or **Redtail → Create Contact**) and map
   `client_first_name`, `client_last_name`, `client_email`, `client_phone`; put `crm_note` in a note / background field.

Payloads are signed: `X-Onboarding-Signature: t=<unix>,v1=HMAC_SHA256(secret, "<t>.<raw body>")`.
Failed deliveries retry on 429/5xx with exponential backoff; every attempt is logged to `webhook_deliveries`.
