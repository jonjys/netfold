-- Netfold transaction machine
create table if not exists wallets (
  token text primary key,
  credits int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists scans (
  id text primary key,
  token text not null unique,
  wallet_token text not null,
  mode text not null,
  source text not null,
  image_hash text,
  item_count int not null default 0,
  teaser_json text not null,
  full_json text not null,
  unlocked boolean not null default false,
  has_kit boolean not null default false,
  public_slug text,
  asking_cents int,
  created_at timestamptz not null default now()
);
create index if not exists scans_wallet_idx on scans (wallet_token);
create index if not exists scans_hash_idx on scans (image_hash);
create index if not exists scans_created_idx on scans (created_at desc);

create table if not exists payments (
  id text primary key,
  provider text not null,
  provider_id text not null unique,
  sku text not null,
  amount_cents int not null,
  currency text not null default 'eur',
  status text not null,
  scan_token text,
  wallet_token text,
  created_at timestamptz not null default now()
);
create index if not exists payments_status_idx on payments (status, created_at desc);

create table if not exists ledger (
  id text primary key,
  entry_type text not null,
  amount_cents int not null,
  currency text not null default 'eur',
  payment_id text,
  scan_token text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists ledger_created_idx on ledger (created_at desc);

create table if not exists webhook_events (
  id text primary key,
  provider text not null,
  provider_id text not null unique,
  kind text not null,
  payload_hash text,
  processed_at timestamptz not null default now()
);

create table if not exists api_usage (
  id text primary key,
  provider text not null,
  kind text not null,
  cost_cents int not null default 0,
  latency_ms int,
  status text not null,
  scan_token text,
  created_at timestamptz not null default now()
);
create index if not exists api_usage_created_idx on api_usage (created_at desc);

create table if not exists events (
  id text primary key,
  name text not null,
  scan_token text,
  sku text,
  source text,
  created_at timestamptz not null default now()
);
create index if not exists events_name_idx on events (name, created_at desc);

create table if not exists rate_limits (
  key text primary key,
  count int not null default 0,
  window_start timestamptz not null default now()
);
