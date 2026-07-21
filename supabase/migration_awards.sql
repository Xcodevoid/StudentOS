-- Incremental migration: Honors & Awards, plus a scope field on Activities.
-- Safe to run standalone — every statement is idempotent.

alter table activities add column if not exists scope text not null default '';

create table if not exists awards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  level text not null default 'school',
  category text not null default '',
  issuer text not null default '',
  date date,
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table awards enable row level security;
drop policy if exists "awards: owner full access" on awards;
create policy "awards: owner full access" on awards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_awards_user on awards(user_id);
