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
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;
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
  created_at timestamptz not null default now()
);

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
  created_at timestamptz not null default now()
);

create table if not exists deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  school_name text not null default '',
  date date,
  type text not null default 'regular',
  status text not null default 'not-started',
  notes text not null default '',
  created_at timestamptz not null default now()
);

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

-- ---------- RLS: lock every table above to its owner ----------
do $$
declare
  t text;
begin
  foreach t in array array['classes','assignments','exams','study_tasks','projects','activities','deadlines','goals','tasks','study_sessions']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "%1$s: owner full access" on %1$s', t);
    execute format(
      'create policy "%1$s: owner full access" on %1$s for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t
    );
  end loop;
end $$;

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
