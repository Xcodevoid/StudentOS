-- Incremental migration: Essay Help + Interview Prep tables.
-- Safe to run standalone — every statement is idempotent.

create table if not exists essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id text not null default '',
  custom_prompt text not null default '',
  title text not null default '',
  word_limit numeric,
  linked_entry_id uuid,
  linked_entry_kind text not null default '',
  draft text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists interview_practice (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null default '',
  question_text text not null default '',
  answer text not null default '',
  self_rating numeric,
  date date,
  created_at timestamptz not null default now()
);

alter table essays enable row level security;
drop policy if exists "essays: owner full access" on essays;
create policy "essays: owner full access" on essays for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table interview_practice enable row level security;
drop policy if exists "interview_practice: owner full access" on interview_practice;
create policy "interview_practice: owner full access" on interview_practice for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_essays_user on essays(user_id);
create index if not exists idx_interview_practice_user on interview_practice(user_id);
