-- StudentOS cloud schema
-- Run this once in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query).
-- Every table is scoped to auth.uid() via Row Level Security, so each student only ever
-- sees their own rows — this is what makes "separate pages per student" actually safe.

-- ---------- profiles ----------
-- One row per user. Holds the small/singleton bits of data.profile plus the
-- jsonb blobs (streak dates, seen badges, reminder dedup) that don't need their own table.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  grade_level text not null default '11th Grade',
  school text not null default '',
  bio text not null default '',
  gpa_scale numeric not null default 4.0,
  onboarded boolean not null default false,
  notifications_enabled boolean not null default false,
  streak_dates jsonb not null default '[]'::jsonb,
  badges_seen jsonb not null default '[]'::jsonb,
  reminders_notified jsonb not null default '{}'::jsonb,
  north_star jsonb not null default '{}'::jsonb,
  public_slug text unique,
  portfolio_public boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Adds the column for projects created before North Star existed.
alter table profiles add column if not exists north_star jsonb not null default '{}'::jsonb;
alter table profiles add column if not exists public_slug text unique;
alter table profiles add column if not exists portfolio_public boolean not null default false;
alter table profiles add column if not exists intended_major text not null default '';
alter table profiles add column if not exists test_targets jsonb not null default '{}'::jsonb;
alter table profiles add column if not exists major_fit jsonb not null default '{}'::jsonb;

alter table profiles drop constraint if exists public_slug_format;
alter table profiles add constraint public_slug_format check (public_slug is null or public_slug ~ '^[a-z0-9-]{3,32}$');

alter table profiles enable row level security;
drop policy if exists "profiles: owner full access" on profiles;
create policy "profiles: owner full access" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a profile row the moment someone signs up, so the app never has
-- to handle a "no profile yet" state after login.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- helper for the list tables below ----------
-- Every table here follows the same shape: a user_id owner column + RLS
-- policy restricting all operations to auth.uid() = user_id.

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  subject text not null default '',
  term text not null default '',
  credits numeric not null default 1,
  weight text not null default 'regular',
  grade numeric,
  created_at timestamptz not null default now()
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references classes(id) on delete set null,
  title text not null default '',
  due_date date,
  status text not null default 'todo',
  priority text not null default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  date date,
  exam_type text not null default 'ap',
  created_at timestamptz not null default now()
);

create table if not exists study_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid references exams(id) on delete cascade,
  topic text not null default '',
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  type text not null default 'project',
  description text not null default '',
  role text not null default '',
  date date,
  link text not null default '',
  tags jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  dimensions jsonb not null default '[]'::jsonb,
  problem text not null default '',
  action_taken text not null default '',
  impact_who text not null default '',
  growth_reflection text not null default '',
  created_at timestamptz not null default now()
);

alter table projects add column if not exists dimensions jsonb not null default '[]'::jsonb;
alter table projects add column if not exists problem text not null default '';
alter table projects add column if not exists action_taken text not null default '';
alter table projects add column if not exists impact_who text not null default '';
alter table projects add column if not exists growth_reflection text not null default '';

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  category text not null default 'activity',
  org text not null default '',
  hours_per_week numeric,
  weeks_per_year numeric,
  start_date date,
  end_date date,
  description text not null default '',
  dimensions jsonb not null default '[]'::jsonb,
  common_app_type text not null default '',
  common_app_position text not null default '',
  common_app_summary text not null default '',
  problem text not null default '',
  action_taken text not null default '',
  impact_who text not null default '',
  growth_reflection text not null default '',
  scope text not null default '',
  created_at timestamptz not null default now()
);

alter table activities add column if not exists dimensions jsonb not null default '[]'::jsonb;
alter table activities add column if not exists common_app_type text not null default '';
alter table activities add column if not exists common_app_position text not null default '';
alter table activities add column if not exists common_app_summary text not null default '';
alter table activities add column if not exists problem text not null default '';
alter table activities add column if not exists action_taken text not null default '';
alter table activities add column if not exists impact_who text not null default '';
alter table activities add column if not exists growth_reflection text not null default '';
alter table activities add column if not exists scope text not null default '';

-- "Opportunities" at the app level (competitions, research programs,
-- internships, scholarships, summer programs, and college applications).
-- The table stays named `deadlines` — only additive migrations happen here,
-- consistent with every other table in this file — but the app reads/writes
-- it as `data.opportunities` via the TABLES map in cloudMap.js.
create table if not exists deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  school_name text not null default '',
  date date,
  type text not null default 'regular',
  status text not null default 'not-started',
  notes text not null default '',
  category text not null default 'college-application',
  application_round text not null default '',
  checklist jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table deadlines add column if not exists category text not null default 'college-application';
alter table deadlines add column if not exists application_round text not null default '';
alter table deadlines add column if not exists checklist jsonb not null default '[]'::jsonb;

-- One-time backfill so deadlines created before this migration keep their
-- meaning: their old `type` (early-action/early-decision/regular) becomes
-- the new `application_round`, and they're tagged as college applications.
update deadlines set application_round = type, category = 'college-application'
  where type in ('early-action', 'early-decision', 'regular') and application_round = '';

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null default '',
  done boolean not null default false,
  week text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid references exams(id) on delete set null,
  minutes numeric not null default 0,
  date date,
  created_at timestamptz not null default now()
);

-- ---------- Momentum: self-discipline system ----------
create table if not exists commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  why text not null default '',
  estimated_minutes numeric,
  deadline text not null default '',
  date date not null default current_date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists momentum_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  commitment_id uuid references commitments(id) on delete set null,
  task_label text not null default '',
  planned_minutes numeric not null default 0,
  actual_minutes numeric not null default 0,
  goal_completed boolean,
  focus_rating numeric,
  date date,
  created_at timestamptz not null default now()
);

create table if not exists distractions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null default '',
  minutes_lost numeric not null default 0,
  date date,
  time text not null default '',
  created_at timestamptz not null default now()
);
-- Distractions became a simple daily focus check-in (stayed_focused +
-- optional note) instead of a per-incident log. Old detailed entries are
-- left in place — they just won't have stayed_focused set.
alter table distractions add column if not exists stayed_focused boolean;
alter table distractions add column if not exists note text not null default '';

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references habits(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now()
);

create table if not exists reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  accomplished text not null default '',
  blocked text not null default '',
  improve text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- Evidence Vault ----------
-- Proof of growth: certificates, screenshots, links, research notes, awards,
-- presentations, photos. `url` holds an external link (link-type evidence);
-- `storage_path` holds a path into the private `evidence` Storage bucket for
-- uploaded files — never both. A file's real URL is never persisted (the
-- bucket is private): resolve it on demand with a signed URL, see
-- src/lib/evidenceStorage.js.
create table if not exists evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  type text not null default 'note',
  url text not null default '',
  storage_path text,
  linked_project_id uuid references projects(id) on delete set null,
  linked_activity_id uuid references activities(id) on delete set null,
  dimensions jsonb not null default '[]'::jsonb,
  date date,
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- Recommendation Brag Sheet ----------
-- Lightweight tracker for who's writing a recommendation letter; `notes`
-- holds specific moments/context worth reminding that recommender about,
-- since the brag sheet document can't guess those. The document itself is
-- assembled on the fly from existing data (see src/lib/bragSheet.js) —
-- nothing about the sheet's content is stored, only the recommender list.
create table if not exists recommenders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  subject text not null default '',
  status text not null default 'not-asked',
  deadline date,
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- Standardized Test Prep ----------
-- One row per sitting. `scores` is a jsonb map of section key -> number,
-- shaped per test type (see src/lib/standardizedTests.js) — sections differ
-- enough across SAT/ACT/TOEFL/IELTS/Duolingo that a flexible jsonb blob beats
-- a wide, mostly-null column set. Composite/superscore math is computed on
-- read, never stored, so it's never stale relative to the raw section scores.
create table if not exists test_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_type text not null default '',
  date date,
  registration_deadline date,
  status text not null default 'planned',
  scores jsonb not null default '{}'::jsonb,
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- Essay Help & Interview Prep ----------
-- Both are matched against Story Builder chapters (projects/activities with
-- Impact Tracker framing) at read time in src/lib/essayHelper.js and
-- src/lib/interviewPrep.js — `linked_entry_id`/`linked_entry_kind` just point
-- back at whichever project or activity row the student picked as the basis
-- for a given essay. Nothing here is AI-generated or stored pre-computed.
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

-- ---------- Honors & Awards ----------
-- Mirrors the Common App Honors section: Title, Level of Recognition
-- (School/State-Regional/National/International — see src/lib/awards.js),
-- an optional issuing organization/category, and a short description.
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

-- ---------- Planner ----------
-- `recurring=true` rows are the weekly skeleton (sleep/meals/hygiene/etc,
-- `days` is a jsonb array of weekday numbers 0-6); `recurring=false` rows
-- are one-off blocks pinned to `date`, either placed manually or by the
-- auto-arrange bin-packer in src/lib/planner.js (`auto_generated=true`,
-- `linked_commitment_id` ties back to the Momentum todo it came from).
create table if not exists planner_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '',
  category text not null default 'custom',
  start_time text not null default '',
  end_time text not null default '',
  recurring boolean not null default false,
  days jsonb not null default '[]'::jsonb,
  date date,
  linked_commitment_id uuid references commitments(id) on delete set null,
  auto_generated boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- RLS: lock every table above to its owner ----------
do $$
declare
  t text;
begin
  foreach t in array array['classes','assignments','exams','study_tasks','projects','activities','deadlines','goals','tasks','study_sessions','commitments','momentum_sessions','distractions','habits','habit_logs','reflections','evidence','recommenders','test_entries','essays','interview_practice','awards','planner_blocks']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "%1$s: owner full access" on %1$s', t);
    execute format(
      'create policy "%1$s: owner full access" on %1$s for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t
    );
  end loop;
end $$;

-- ---------- Evidence Vault storage bucket ----------
-- Private bucket — files are only ever reached via a short-lived signed URL
-- (supabase.storage.from('evidence').createSignedUrl(...)), never a public
-- URL. RLS on storage.objects scopes every operation to files stored under
-- a {auth.uid()}/... path prefix, so uploading, listing, or deleting
-- another student's file is impossible even with the anon key.
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

drop policy if exists "evidence: owner select" on storage.objects;
create policy "evidence: owner select" on storage.objects
  for select using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "evidence: owner insert" on storage.objects;
create policy "evidence: owner insert" on storage.objects
  for insert with check (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "evidence: owner update" on storage.objects;
create policy "evidence: owner update" on storage.objects
  for update using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "evidence: owner delete" on storage.objects;
create policy "evidence: owner delete" on storage.objects
  for delete using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- public portfolio sharing ----------
-- Every table above is locked to auth.uid() = user_id, so an anonymous site
-- visitor can't read them directly. These two views are the one deliberate,
-- narrow exception: a student can flip `portfolio_public = true` and get a
-- shareable /p/<slug> link.
--
-- Views in Postgres run with the privileges of their OWNER (not the caller)
-- unless created with `security_invoker = true` — which is exactly what
-- lets the `anon` role see a row here despite the base tables' RLS. That is
-- only safe because the security boundary has moved from RLS into this
-- file: the WHERE clause and column list below are fixed, not caller-
-- supplied. Never change either to accept a parameter or widen the column
-- list to `select *` — that would leak every public student's private data
-- (GPA, streaks, reflections, north_star, etc. all live on the same
-- `profiles` row as the public bio).
create or replace view public_portfolios as
  select public_slug, name, grade_level, school, bio
  from profiles
  where portfolio_public = true and public_slug is not null;

create or replace view public_portfolio_projects as
  select pr.public_slug, p.title, p.type, p.description, p.role, p.date, p.link, p.tags, p.featured
  from projects p
  join profiles pr on pr.id = p.user_id
  where pr.portfolio_public = true and pr.public_slug is not null;

grant select on public_portfolios to anon, authenticated;
grant select on public_portfolio_projects to anon, authenticated;

-- ---------- indexes ----------
create index if not exists idx_assignments_user on assignments(user_id);
create index if not exists idx_exams_user on exams(user_id);
create index if not exists idx_study_tasks_user on study_tasks(user_id);
create index if not exists idx_study_tasks_exam on study_tasks(exam_id);
create index if not exists idx_projects_user on projects(user_id);
create index if not exists idx_activities_user on activities(user_id);
create index if not exists idx_deadlines_user on deadlines(user_id);
create index if not exists idx_goals_user on goals(user_id);
create index if not exists idx_tasks_user on tasks(user_id);
create index if not exists idx_study_sessions_user on study_sessions(user_id);
create index if not exists idx_classes_user on classes(user_id);
create index if not exists idx_commitments_user on commitments(user_id);
create index if not exists idx_commitments_date on commitments(date);
create index if not exists idx_momentum_sessions_user on momentum_sessions(user_id);
create index if not exists idx_distractions_user on distractions(user_id);
create index if not exists idx_habits_user on habits(user_id);
create index if not exists idx_habit_logs_user on habit_logs(user_id);
create index if not exists idx_habit_logs_habit on habit_logs(habit_id);
create index if not exists idx_reflections_user on reflections(user_id);
create index if not exists idx_reflections_date on reflections(date);
create index if not exists idx_evidence_user on evidence(user_id);
create index if not exists idx_evidence_project on evidence(linked_project_id);
create index if not exists idx_evidence_activity on evidence(linked_activity_id);
create index if not exists idx_recommenders_user on recommenders(user_id);
create index if not exists idx_test_entries_user on test_entries(user_id);
create index if not exists idx_essays_user on essays(user_id);
create index if not exists idx_interview_practice_user on interview_practice(user_id);
create index if not exists idx_awards_user on awards(user_id);
create index if not exists idx_planner_blocks_user on planner_blocks(user_id);
create index if not exists idx_planner_blocks_date on planner_blocks(date);
