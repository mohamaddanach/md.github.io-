import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MAX_FILE_MB = 15;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

export default function App() {
  return (
    <BrowserRouter>
      <style>{styles}</style>
      <Routes>
        <Route path="/onboard/:advisorId" element={<IntakePortal />} />
        <Route path="/" element={<Navigate to="/onboard/demo" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ------------------------------------------------------------------------ */
/* Client-facing, white-labeled intake portal                               */
/* ------------------------------------------------------------------------ */

function IntakePortal() {
  const { advisorId } = useParams();
  const [advisor, setAdvisor] = useState(null);
  const [advisorError, setAdvisorError] = useState(false);

  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState(null);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setAdvisor(null);
    setAdvisorError(false);
    axios
      .get(`${API_BASE}/advisors/${encodeURIComponent(advisorId)}/public`)
      .then((res) => {
        if (cancelled) return;
        setAdvisor(res.data);
        document.title = `Client Onboarding · ${res.data.firm_name}`;
      })
      .catch(() => !cancelled && setAdvisorError(true));
    return () => {
      cancelled = true;
    };
  }, [advisorId]);

  const errors = validate(form, file, consent);
  const isValid = Object.keys(errors).length === 0;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));
  const showError = (field) => touched[field] && errors[field];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true, file: true, consent: true });
    if (!isValid) return;

    setSubmitting(true);
    setSubmitError('');
    const data = new FormData();
    data.append('full_name', form.fullName);
    data.append('email', form.email);
    data.append('phone', form.phone);
    data.append('consent', String(consent));
    data.append('file', file);

    try {
      const res = await axios.post(
        `${API_BASE}/onboard/${encodeURIComponent(advisorId)}/submit`,
        data,
        { timeout: 120_000 },
      );
      setResult(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setSubmitError(
        typeof detail === 'string'
          ? detail
          : 'Something went wrong while uploading your statement. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (advisorError) return <NotFound />;
  if (!advisor) {
    return (
      <div className="page center">
        <Loader2 className="spin" size={28} />
      </div>
    );
  }

  return (
    <div className="page" style={{ '--brand': advisor.brand_color || '#1e3a5f' }}>
      <header className="brandbar">
        {advisor.logo_url ? (
          <img src={advisor.logo_url} alt={advisor.firm_name} className="logo" />
        ) : (
          <div className="monogram">{initials(advisor.firm_name)}</div>
        )}
        <span className="firm">{advisor.firm_name}</span>
        <span className="secure">
          <Lock size={14} /> Secure client portal
        </span>
      </header>

      <main className="card">
        {result ? (
          <SuccessState result={result} name={form.fullName} />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h1>Welcome — let's get you set up</h1>
            <p className="lede">
              {advisor.welcome_message ||
                'Share your contact details and most recent account statement so your advisor can prepare for your first meeting.'}
            </p>

            <Steps />

            <section>
              <h2>1. Your contact details</h2>
              <div className="grid">
                <Field label="Full name" error={showError('fullName')} className="span-2">
                  <input
                    value={form.fullName}
                    onChange={update('fullName')}
                    onBlur={blur('fullName')}
                    autoComplete="name"
                    placeholder="Jane A. Smith"
                  />
                </Field>
                <Field label="Email" error={showError('email')}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    onBlur={blur('email')}
                    autoComplete="email"
                    placeholder="jane@example.com"
                  />
                </Field>
                <Field label="Phone number" error={showError('phone')}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    onBlur={blur('phone')}
                    autoComplete="tel"
                    placeholder="(555) 555-0123"
                  />
                </Field>
              </div>
            </section>

            <section>
              <h2>2. Upload your latest statement</h2>
              <Dropzone
                file={file}
                onFile={(f) => {
                  setFile(f);
                  setTouched((t) => ({ ...t, file: true }));
                }}
                error={showError('file')}
              />
              <p className="hint">
                Brokerage, retirement (IRA/401k) or bank statement · PDF up to {MAX_FILE_MB} MB
              </p>
            </section>

            <label className={`consent ${showError('consent') ? 'has-error' : ''}`}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                I authorize {advisor.firm_name} to receive and review this statement for the
                purpose of financial planning and account onboarding.
              </span>
            </label>

            {submitError && (
              <div className="alert">
                <AlertCircle size={18} /> {submitError}
              </div>
            )}

            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="spin" size={18} /> Securely processing your statement…
                </>
              ) : (
                'Submit securely'
              )}
            </button>

            <p className="trust">
              <ShieldCheck size={16} /> Encrypted in transit. Your statement is shared only with{' '}
              {advisor.firm_name}.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}

function Steps() {
  return (
    <ol className="steps">
      <li className="active">Contact details</li>
      <li className="active">Statement upload</li>
      <li>Advisor review</li>
    </ol>
  );
}

function Field({ label, error, className = '', children }) {
  return (
    <label className={`field ${className} ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}

function Dropzone({ file, onFile, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const pick = (files) => {
    const f = files?.[0];
    if (f) onFile(f);
  };

  if (file) {
    return (
      <div className={`filechip ${error ? 'has-error' : ''}`}>
        <FileText size={22} />
        <div>
          <strong>{file.name}</strong>
          <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
          {error && <small className="err">{error}</small>}
        </div>
        <button type="button" className="icon" onClick={() => onFile(null)} aria-label="Remove file">
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={`dropzone ${dragging ? 'dragging' : ''} ${error ? 'has-error' : ''}`}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        pick(e.dataTransfer.files);
      }}
    >
      <UploadCloud size={34} />
      <strong>Drag & drop your PDF here</strong>
      <span>or click to browse</span>
      {error && <small className="err">{error}</small>}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={(e) => pick(e.target.files)}
      />
    </div>
  );
}

function SuccessState({ result, name }) {
  const firstName = name.trim().split(/\s+/)[0];
  return (
    <div className="success">
      <CheckCircle2 size={56} />
      <h1>Thank you{firstName ? `, ${firstName}` : ''}!</h1>
      <p className="lede">
        Your statement was received securely. The {result.firm_name} team will review it and
        reach out within one business day to schedule your onboarding meeting.
      </p>
      <div className="ref">
        Reference number <strong>{result.reference}</strong>
      </div>
      <Steps />
    </div>
  );
}

function NotFound() {
  return (
    <div className="page center">
      <div className="card narrow">
        <AlertCircle size={36} />
        <h1>Portal not found</h1>
        <p className="lede">Please check the link your advisor sent you and try again.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Helpers                                                                  */
/* ------------------------------------------------------------------------ */

function validate(form, file, consent) {
  const e = {};
  if (form.fullName.trim().split(/\s+/).filter(Boolean).length < 2)
    e.fullName = 'Please enter your first and last name.';
  if (!EMAIL_RE.test(form.email.trim())) e.email = 'Please enter a valid email address.';
  const digits = form.phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) e.phone = 'Please enter a valid phone number.';
  if (!file) e.file = 'Please attach your statement.';
  else if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))
    e.file = 'Only PDF statements are supported.';
  else if (file.size > MAX_FILE_MB * 1024 * 1024) e.file = `File must be under ${MAX_FILE_MB} MB.`;
  if (!consent) e.consent = 'Consent is required.';
  return e;
}

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/* ------------------------------------------------------------------------ */
/* Styles (kept in-file so the portal is a single drop-in component)        */
/* ------------------------------------------------------------------------ */

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #f4f6f9; color: #1c2430;
         font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .page { min-height: 100vh; padding: 0 16px 48px; }
  .page.center { display: grid; place-items: center; padding-top: 0; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .brandbar { max-width: 720px; margin: 0 auto; display: flex; align-items: center; gap: 12px;
              padding: 24px 0; }
  .logo { height: 40px; width: auto; }
  .monogram { width: 40px; height: 40px; border-radius: 10px; background: var(--brand); color: #fff;
              display: grid; place-items: center; font-weight: 700; letter-spacing: .5px; }
  .firm { font-weight: 650; font-size: 17px; }
  .secure { margin-left: auto; display: inline-flex; align-items: center; gap: 6px;
            font-size: 13px; color: #4b5a6b; }

  .card { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 16px;
          border: 1px solid #e3e8ef; box-shadow: 0 8px 30px rgba(20, 35, 60, .06);
          padding: 36px 40px; }
  .card.narrow { max-width: 420px; text-align: center; }
  h1 { font-size: 26px; margin: 0 0 8px; letter-spacing: -.01em; }
  h2 { font-size: 15px; margin: 28px 0 12px; color: #2b3746; text-transform: uppercase;
       letter-spacing: .04em; }
  .lede { color: #4b5a6b; line-height: 1.55; margin: 0 0 8px; }

  .steps { display: flex; gap: 8px; list-style: none; padding: 0; margin: 24px 0 0; counter-reset: s; }
  .steps li { flex: 1; font-size: 12px; color: #8795a6; padding-top: 10px;
              border-top: 3px solid #e3e8ef; counter-increment: s; }
  .steps li::before { content: counter(s) ". "; }
  .steps li.active { color: var(--brand); border-top-color: var(--brand); font-weight: 600; }

  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
  .span-2 { grid-column: span 2; }
  .field { display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 550; }
  .field input { font: inherit; font-weight: 400; padding: 11px 12px; border-radius: 10px;
                 border: 1px solid #cfd7e2; outline: none; transition: border-color .15s, box-shadow .15s; }
  .field input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 18%, transparent); }
  .field.has-error input { border-color: #d14343; }
  .field small, .err { color: #d14343; font-weight: 500; font-size: 12.5px; }

  .dropzone { border: 2px dashed #cfd7e2; border-radius: 14px; padding: 32px 16px; text-align: center;
              display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;
              color: #4b5a6b; transition: border-color .15s, background .15s; }
  .dropzone svg { color: var(--brand); }
  .dropzone:hover, .dropzone:focus-visible, .dropzone.dragging {
    border-color: var(--brand); background: color-mix(in srgb, var(--brand) 5%, #fff); outline: none; }
  .dropzone.has-error { border-color: #d14343; }
  .dropzone strong { color: #1c2430; }
  .filechip { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px;
              border: 1px solid #cfd7e2; background: #f8fafc; }
  .filechip.has-error { border-color: #d14343; }
  .filechip svg { color: var(--brand); flex-shrink: 0; }
  .filechip div { display: flex; flex-direction: column; min-width: 0; }
  .filechip strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .filechip small { color: #6b7a8c; }
  .icon { margin-left: auto; background: none; border: 0; cursor: pointer; color: #6b7a8c; padding: 6px;
          border-radius: 8px; }
  .icon:hover { background: #e9eef4; }
  .hint { font-size: 12.5px; color: #6b7a8c; margin: 8px 0 0; }

  .consent { display: flex; gap: 10px; align-items: flex-start; margin: 24px 0 0; font-size: 13.5px;
             color: #4b5a6b; line-height: 1.5; cursor: pointer; }
  .consent input { margin-top: 3px; accent-color: var(--brand); width: 16px; height: 16px; }
  .consent.has-error span { color: #d14343; }

  .alert { display: flex; gap: 8px; align-items: center; margin-top: 18px; padding: 12px 14px;
           border-radius: 10px; background: #fdecec; color: #a12d2d; font-size: 14px; }
  .primary { width: 100%; margin-top: 22px; padding: 14px; border: 0; border-radius: 12px;
             background: var(--brand); color: #fff; font: inherit; font-weight: 650; font-size: 16px;
             cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 10px;
             transition: filter .15s; }
  .primary:hover:not(:disabled) { filter: brightness(1.1); }
  .primary:disabled { opacity: .75; cursor: progress; }
  .trust { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12.5px;
           color: #6b7a8c; margin: 14px 0 0; }

  .success { text-align: center; }
  .success > svg { color: var(--brand); margin-bottom: 12px; }
  .ref { display: inline-block; margin-top: 16px; padding: 10px 16px; border-radius: 10px;
         background: #f1f4f8; font-size: 14px; color: #4b5a6b; }
  .ref strong { color: #1c2430; letter-spacing: .06em; margin-left: 6px; }
  .success .steps li:last-child { color: var(--brand); border-top-color: var(--brand); font-weight: 600; }

  @media (max-width: 640px) {
    .card { padding: 24px 20px; }
    .grid { grid-template-columns: 1fr; }
    .span-2 { grid-column: auto; }
    .secure { display: none; }
  }
`;
