-- =============================================
-- EduTrack AI — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- 1. PROFILES (linked to Supabase Auth)
-- =============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  role text not null default 'student' check (role in ('admin', 'faculty', 'student')),
  avatar text,
  is_active boolean default true,
  last_login timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 2. STREAMS
-- =============================================
create table streams (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  code text unique not null,
  description text,
  color text default '#6366F1',
  icon text default '📚',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 3. BADGES
-- =============================================
create table badges (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  icon text not null,
  description text,
  criteria jsonb,
  created_at timestamptz default now()
);

-- =============================================
-- 4. STUDENTS
-- =============================================
create table students (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references profiles(id) on delete cascade,
  roll_number text unique not null,
  stream_id uuid references streams(id),
  batch text,
  phone text,
  current_streak integer default 0,
  longest_streak integer default 0,
  total_submissions integer default 0,
  last_submission_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 5. FACULTY
-- =============================================
create table faculty (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references profiles(id) on delete cascade,
  department text,
  phone text,
  bio text,
  total_reviewed integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 6. STREAM ↔ FACULTY (many-to-many)
-- =============================================
create table stream_faculty (
  stream_id uuid not null references streams(id) on delete cascade,
  faculty_id uuid not null references faculty(id) on delete cascade,
  primary key (stream_id, faculty_id)
);

-- =============================================
-- 7. STUDENT ↔ BADGES (many-to-many)
-- =============================================
create table student_badges (
  student_id uuid not null references students(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  earned_at timestamptz default now(),
  primary key (student_id, badge_id)
);

-- =============================================
-- 8. SUBMISSIONS
-- =============================================
create table submissions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  stream_id uuid references streams(id),
  title text not null,
  description text,
  files jsonb default '[]',
  status text default 'submitted' check (status in ('submitted', 'reviewed', 'approved', 'needs_improvement', 'late')),
  submission_date timestamptz default now(),
  ai_score integer,
  ai_summary text,
  ai_tags text[] default '{}',
  ai_analyzed boolean default false,
  version integer default 1,
  previous_versions jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 9. FEEDBACK
-- =============================================
create table feedback (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references submissions(id) on delete cascade,
  faculty_id uuid not null references profiles(id),
  remarks text not null,
  rating integer check (rating >= 1 and rating <= 5),
  ai_feedback_suggestion text,
  used_ai_suggestion boolean default false,
  private_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 10. NOTIFICATIONS
-- =============================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid not null references profiles(id) on delete cascade,
  type text,
  title text not null,
  message text,
  link text,
  icon text default '🔔',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- 11. AUDIT LOGS
-- =============================================
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  action text not null,
  entity text,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- =============================================
-- INDEXES
-- =============================================
create index idx_students_user_id on students(user_id);
create index idx_students_stream on students(stream_id);
create index idx_submissions_student on submissions(student_id);
create index idx_submissions_stream on submissions(stream_id);
create index idx_submissions_date on submissions(submission_date);
create index idx_submissions_status on submissions(status);
create index idx_feedback_submission on feedback(submission_id);
create index idx_notifications_recipient on notifications(recipient_id);
create index idx_notifications_read on notifications(recipient_id, is_read);
create index idx_audit_logs_user on audit_logs(user_id);

-- =============================================
-- AUTO-CREATE PROFILE ON AUTH SIGNUP (trigger)
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- AUTO-UPDATE updated_at TIMESTAMP
-- =============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on profiles for each row execute function update_updated_at();
create trigger set_updated_at before update on students for each row execute function update_updated_at();
create trigger set_updated_at before update on faculty for each row execute function update_updated_at();
create trigger set_updated_at before update on streams for each row execute function update_updated_at();
create trigger set_updated_at before update on submissions for each row execute function update_updated_at();
create trigger set_updated_at before update on feedback for each row execute function update_updated_at();

-- =============================================
-- SEED DEFAULT BADGES
-- =============================================
insert into badges (name, icon, description) values
  ('First Step', '🌱', 'Made your first submission'),
  ('On Fire', '🔥', '7-day submission streak'),
  ('Consistent', '💎', '30-day submission streak'),
  ('Top Scorer', '🏆', 'Scored 90+ on a submission'),
  ('Perfect Week', '⭐', 'Submitted every day for a week'),
  ('Overachiever', '🚀', '10+ submissions in a week');

-- =============================================
-- RLS POLICIES (basic — allow service role full access)
-- =============================================
alter table profiles enable row level security;
alter table students enable row level security;
alter table faculty enable row level security;
alter table streams enable row level security;
alter table submissions enable row level security;
alter table feedback enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table badges enable row level security;
alter table student_badges enable row level security;
alter table stream_faculty enable row level security;

-- Allow authenticated users to read their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Service role full access profiles" on profiles for all using (true);

-- Public read access for streams and badges
create policy "Anyone can read streams" on streams for select using (true);
create policy "Service role full access streams" on streams for all using (true);
create policy "Anyone can read badges" on badges for select using (true);
create policy "Service role full access badges" on badges for all using (true);

-- Students/faculty readable by authenticated users
create policy "Authenticated read students" on students for select using (auth.role() = 'authenticated');
create policy "Service role full access students" on students for all using (true);
create policy "Authenticated read faculty" on faculty for select using (auth.role() = 'authenticated');
create policy "Service role full access faculty" on faculty for all using (true);

-- Submissions readable by authenticated users
create policy "Authenticated read submissions" on submissions for select using (auth.role() = 'authenticated');
create policy "Service role full access submissions" on submissions for all using (true);

-- Feedback readable by authenticated users
create policy "Authenticated read feedback" on feedback for select using (auth.role() = 'authenticated');
create policy "Service role full access feedback" on feedback for all using (true);

-- Notifications only for own user
create policy "Users read own notifications" on notifications for select using (auth.uid() = recipient_id);
create policy "Service role full access notifications" on notifications for all using (true);

-- Audit logs admin only via service role
create policy "Service role full access audit" on audit_logs for all using (true);

-- Join tables
create policy "Service role full access stream_faculty" on stream_faculty for all using (true);
create policy "Authenticated read stream_faculty" on stream_faculty for select using (auth.role() = 'authenticated');
create policy "Service role full access student_badges" on student_badges for all using (true);
create policy "Authenticated read student_badges" on student_badges for select using (auth.role() = 'authenticated');
