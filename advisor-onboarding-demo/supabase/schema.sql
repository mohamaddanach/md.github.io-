-- Automated Client Onboarding Engine — Supabase schema
-- Run in the Supabase SQL editor. Safe to re-run.

create extension if not exists pgcrypto;

-- One row per RIA firm / advisor (tenant).
create table if not exists advisors (
  advisor_id      text primary key,                 -- URL slug: /onboard/<advisor_id>
  firm_name       text not null,
  logo_url        text,
  brand_color     text not null default '#1e3a5f',
  welcome_message text,
  webhook_url     text,                             -- Zapier / Make catch-hook URL
  webhook_secret  text,                             -- HMAC signing secret
  dispatch_mode   text not null default 'on_extract'
                  check (dispatch_mode in ('on_extract', 'on_approve')),
  created_at      timestamptz not null default now()
);

-- One row per client intake submission.
create table if not exists client_submissions (
  id                  uuid primary key default gen_random_uuid(),
  advisor_id          text not null references advisors(advisor_id) on delete cascade,
  full_name           text not null,
  first_name          text,
  last_name           text,
  email               text not null,
  phone               text,
  institution_name    text,
  total_assets        numeric(18, 2),
  liquid_cash         numeric(18, 2),
  monthly_income      numeric(18, 2),
  account_type        text,
  confidence          jsonb not null default '{}',
  flags               jsonb not null default '{}',
  original_extraction jsonb,                        -- immutable AI output, for audit trail
  review_status       text not null default 'pending_review',  -- pending_review | needs_review | approved | rejected
  crm_sync_status     text not null default 'not_sent',        -- not_sent | queued | synced | failed
  crm_synced_at       timestamptz,
  source_filename     text,
  created_at          timestamptz not null default now()
);
create index if not exists client_submissions_advisor_idx on client_submissions (advisor_id, created_at desc);

-- Every outbound webhook attempt, for troubleshooting and compliance.
create table if not exists webhook_deliveries (
  id            bigserial primary key,
  event_id      uuid not null,
  submission_id uuid,
  advisor_id    text,
  event         text not null,
  target_url    text not null,
  attempts      int not null,
  status_code   int,
  delivered     boolean not null,
  error         text,
  payload       jsonb,
  created_at    timestamptz not null default now()
);

-- The API uses the service-role key server-side. Lock tables down from the anon key:
alter table advisors           enable row level security;
alter table client_submissions enable row level security;
alter table webhook_deliveries enable row level security;

-- Demo tenant used by the portal at /onboard/demo
insert into advisors (advisor_id, firm_name, welcome_message)
values ('demo', 'Summit Ridge Wealth Partners',
        'Securely share your latest statement so we can prepare for your first planning meeting.')
on conflict (advisor_id) do nothing;
