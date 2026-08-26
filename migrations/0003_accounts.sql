-- Per-user accounts and purchases (auth on).
create table if not exists accounts (
  user_id text primary key,
  email text,
  name text,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists purchases (
  id text primary key,
  user_id text not null,
  sku text not null,
  product_id text not null,
  scan_token text,
  stripe_session_id text unique,
  amount_cents int not null,
  currency text not null default 'eur',
  status text not null default 'paid',
  created_at timestamptz not null default now()
);
create index if not exists purchases_user_idx on purchases (user_id, created_at desc);

alter table payments add column if not exists user_id text;
create index if not exists payments_user_idx on payments (user_id);

alter table scans add column if not exists user_id text;
create index if not exists scans_user_idx on scans (user_id);
