-- ============================================================================
-- CAPACITY CONNECT — initial schema + Row Level Security
--
-- Maps 1:1 onto the TypeScript domain models in lib/types/domain.ts.
-- Run in a fresh Supabase project (SQL editor or `supabase db push`).
--
-- Security model:
--   * auth.users owns identity; public.profiles carries role + status.
--   * Users CANNOT assign themselves admin or activate themselves — the
--     trigger defaults every signup to trainee/pending and column grants
--     keep role/status admin-only.
--   * All data access is guarded by RLS; the anon key is safe in the client.
-- ============================================================================

create extension if not exists pgcrypto;

-- ------------------------------- profiles ----------------------------------

create table public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  email            text not null unique,
  name             text not null,
  initials         text not null default '',
  role             text not null default 'trainee'
                   check (role in ('trainee', 'trainer', 'admin')),
  status           text not null default 'pending'
                   check (status in ('pending', 'active', 'disabled')),
  title            text not null default '',
  specialisation   text,
  years_experience int,
  expertise        text[] not null default '{}',
  bio              text,
  region           text,
  phone            text,
  joined_on        date not null default current_date,
  created_at       timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "admins read all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
    )
  );

-- Column-level grants: users may edit their own descriptive fields only.
-- role/status have no user-level UPDATE grant at all.
create policy "update own profile fields" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

revoke update on table public.profiles from authenticated;
grant update (name, initials, title, specialisation, years_experience, expertise, bio, region, phone)
  on public.profiles to authenticated;

create policy "admins update any profile" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
    )
  );

-- New auth users: default to trainee + pending. Role/status are admin-managed.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, initials, role, status, title)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    upper(left(coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), 2)),
    'trainee',   -- never trust client-provided role at signup
    'pending',   -- every account starts pending until an admin approves it
    coalesce(new.raw_user_meta_data ->> 'title', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------- courses -----------------------------------

create table public.courses (
  id          text primary key,
  code        text not null,
  title       text not null,
  description text not null,
  category    text not null,
  subject     text,
  level       text not null check (level in ('beginner', 'intermediate', 'advanced')),
  hours       int  not null default 1,
  trainer_id  uuid not null references public.profiles (id) on delete cascade,
  outcomes    text[] not null default '{}',
  tags        text[] not null default '{}',
  status      text not null default 'draft' check (status in ('draft', 'published')),
  added_at    date not null default current_date
);

alter table public.courses enable row level security;

create policy "published courses readable by authenticated users" on public.courses
  for select using (
    status = 'published'
    or trainer_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
    )
  );

create policy "trainers manage own courses" on public.courses
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

create policy "admins manage all courses" on public.courses
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
    )
  );

-- ------------------------------- modules -----------------------------------

create table public.modules (
  id        text primary key,
  course_id text not null references public.courses (id) on delete cascade,
  title     text not null,
  summary   text not null default '',
  minutes   int  not null default 45,
  position  int  not null default 1
);

alter table public.modules enable row level security;

create policy "modules readable with parent course" on public.modules
  for select using (
    exists (
      select 1 from public.courses c
      where c.id = course_id
        and (c.status = 'published' or c.trainer_id = auth.uid()
             or exists (
               select 1 from public.profiles p
               where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
             ))
    )
  );

create policy "trainers manage own course modules" on public.modules
  for all using (
    exists (select 1 from public.courses c where c.id = course_id and c.trainer_id = auth.uid())
  ) with check (
    exists (select 1 from public.courses c where c.id = course_id and c.trainer_id = auth.uid())
  );

-- ------------------------------ resources ----------------------------------
-- `ref` is the Supabase Storage object path (bucket: `resources`).
-- Files are private; access goes through the storage policies below.

create table public.resources (
  id          text primary key,
  module_id   text not null references public.modules (id) on delete cascade,
  title       text not null,
  kind        text not null check (kind in ('recorded-lecture','presentation','study-material','dataset','reference')),
  format      text not null,
  minutes     int,
  ref         text not null,          -- storage path, empty for descriptive demo items
  file_name   text,
  file_bytes  bigint,
  mime        text,
  published   boolean not null default false,
  uploaded_by uuid references public.profiles (id),
  created_at  timestamptz not null default now()
);

alter table public.resources enable row level security;

create policy "published resources readable with parent course" on public.resources
  for select using (
    (published and exists (
      select 1 from public.modules m join public.courses c on c.id = m.course_id
      where m.id = module_id and c.status = 'published'
    ))
    or exists (
      select 1 from public.modules m join public.courses c on c.id = m.course_id
      where m.id = module_id and (c.trainer_id = auth.uid()
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
        ))
    )
  );

create policy "trainers manage own course resources" on public.resources
  for all using (
    exists (
      select 1 from public.modules m join public.courses c on c.id = m.course_id
      where m.id = module_id and c.trainer_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.modules m join public.courses c on c.id = m.course_id
      where m.id = module_id and c.trainer_id = auth.uid()
    )
  );

-- ------------------------------ enrollments --------------------------------

create table public.enrollments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  course_id         text not null references public.courses (id) on delete cascade,
  status            text not null default 'active' check (status in ('active', 'completed')),
  enrolled_at       timestamptz not null default now(),
  completed_modules text[] not null default '{}',
  last_module_id    text,
  unique (user_id, course_id)
);

alter table public.enrollments enable row level security;

create policy "read own enrollments" on public.enrollments
  for select using (user_id = auth.uid());

create policy "enroll self in published courses" on public.enrollments
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.courses c where c.id = course_id and c.status = 'published')
  );

create policy "update own enrollment progress" on public.enrollments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Trainers monitor enrollments in their own courses; admins see everything.
create policy "trainers read course enrollments" on public.enrollments
  for select using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.trainer_id = auth.uid()
    )
  );

create policy "admins read all enrollments" on public.enrollments
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
    )
  );

-- ------------------------- assessments + questions -------------------------

create table public.assessments (
  id                 text primary key,
  course_id          text not null references public.courses (id) on delete cascade,
  title              text not null,
  subject            text not null,
  pass_mark          int  not null default 60,
  time_limit_minutes int  not null default 15
);

alter table public.assessments enable row level security;

create policy "assessments readable with parent course" on public.assessments
  for select using (
    exists (
      select 1 from public.courses c
      where c.id = course_id
        and (c.status = 'published' or c.trainer_id = auth.uid()
             or exists (
               select 1 from public.profiles p
               where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
             ))
    )
  );

create policy "trainers manage own course assessments" on public.assessments
  for all using (
    exists (select 1 from public.courses c where c.id = course_id and c.trainer_id = auth.uid())
  ) with check (
    exists (select 1 from public.courses c where c.id = course_id and c.trainer_id = auth.uid())
  );

create table public.questions (
  id            text primary key,
  assessment_id text not null references public.assessments (id) on delete cascade,
  prompt        text not null,
  options       text[] not null,
  answer_index  int  not null,
  explanation   text not null default '',
  position      int  not null default 1
);

alter table public.questions enable row level security;

create policy "questions readable with parent assessment" on public.questions
  for select using (
    exists (
      select 1 from public.assessments a join public.courses c on c.id = a.course_id
      where a.id = assessment_id
        and (c.status = 'published' or c.trainer_id = auth.uid()
             or exists (
               select 1 from public.profiles p
               where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
             ))
    )
  );

create policy "trainers manage own assessment questions" on public.questions
  for all using (
    exists (
      select 1 from public.assessments a join public.courses c on c.id = a.course_id
      where a.id = assessment_id and c.trainer_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.assessments a join public.courses c on c.id = a.course_id
      where a.id = assessment_id and c.trainer_id = auth.uid()
    )
  );

-- ------------------------------ quiz results -------------------------------

create table public.quiz_results (
  id            uuid primary key default gen_random_uuid(),
  assessment_id text not null references public.assessments (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  course_id     text not null references public.courses (id) on delete cascade,
  score         int  not null,
  passed        boolean not null,
  answers       jsonb not null default '{}',
  attempted_at  timestamptz not null default now()
);

alter table public.quiz_results enable row level security;

create policy "read own results" on public.quiz_results
  for select using (user_id = auth.uid());

create policy "record own attempts" on public.quiz_results
  for insert with check (user_id = auth.uid());

create policy "trainers read results for their courses" on public.quiz_results
  for select using (
    exists (select 1 from public.courses c where c.id = course_id and c.trainer_id = auth.uid())
  );

create policy "admins read all results" on public.quiz_results
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
    )
  );

-- -------------------------------- feedback ---------------------------------

create table public.feedback (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  course_id         text not null references public.courses (id) on delete cascade,
  rating            int  not null check (rating between 1 and 5),
  relevance_comment text not null default '',
  trainer_comment   text not null default '',
  submitted_at      timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.feedback enable row level security;

create policy "read own feedback" on public.feedback
  for select using (user_id = auth.uid());

create policy "submit own feedback" on public.feedback
  for insert with check (user_id = auth.uid());

create policy "update own feedback" on public.feedback
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "trainers read feedback for their courses" on public.feedback
  for select using (
    exists (select 1 from public.courses c where c.id = course_id and c.trainer_id = auth.uid())
  );

create policy "admins read all feedback" on public.feedback
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
    )
  );

-- ------------------------------ certificates -------------------------------

create table public.certificates (
  id          text primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  course_id   text not null references public.courses (id) on delete cascade,
  course_title text not null,
  score       int  not null,
  issued_at   timestamptz not null default now()
);

alter table public.certificates enable row level security;

create policy "read own certificates" on public.certificates
  for select using (user_id = auth.uid());

create policy "issue own certificate on completion" on public.certificates
  for insert with check (user_id = auth.uid());

create policy "trainers read certificates for their courses" on public.certificates
  for select using (
    exists (select 1 from public.courses c where c.id = course_id and c.trainer_id = auth.uid())
  );

create policy "admins read all certificates" on public.certificates
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
    )
  );

-- ----------------------------- questionnaires ------------------------------

create table public.questionnaires (
  id          text primary key,
  trainer_id  uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  description text not null default '',
  deadline    date not null,
  questions   jsonb not null default '[]'
);

alter table public.questionnaires enable row level security;

create policy "questionnaires readable by authenticated users" on public.questionnaires
  for select using (true);

create policy "trainers manage own questionnaires" on public.questionnaires
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

create table public.questionnaire_responses (
  id               uuid primary key default gen_random_uuid(),
  questionnaire_id text not null references public.questionnaires (id) on delete cascade,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  answers          jsonb not null default '{}',
  submitted_at     timestamptz not null default now(),
  unique (questionnaire_id, user_id)
);

alter table public.questionnaire_responses enable row level security;

create policy "read own responses" on public.questionnaire_responses
  for select using (user_id = auth.uid());

create policy "submit own responses" on public.questionnaire_responses
  for insert with check (user_id = auth.uid());

create policy "trainers read responses to own questionnaires" on public.questionnaire_responses
  for select using (
    exists (
      select 1 from public.questionnaires q
      where q.id = questionnaire_id and q.trainer_id = auth.uid()
    )
  );

-- ------------------------ notifications + announcements --------------------

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  kind       text not null default 'system'
             check (kind in ('announcement', 'achievement', 'deadline', 'system', 'content')),
  title      text not null,
  body       text not null default '',
  href       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "read own notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "insert own notifications" on public.notifications
  for insert with check (user_id = auth.uid());

create policy "update own notification read-state" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null default '',
  audience     text not null default 'all' check (audience in ('all', 'trainee', 'trainer')),
  published_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "announcements readable by authenticated users" on public.announcements
  for select using (auth.uid() is not null);

create policy "admins publish announcements" on public.announcements
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
    )
  );

-- ------------------------- achievements + competencies ---------------------

create table public.achievements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete cascade,
  title       text not null,
  description text not null default '',
  icon        text not null default 'award'
              check (icon in ('award', 'flame', 'target', 'rocket', 'medal')),
  earned_at   timestamptz not null default now()
);

alter table public.achievements enable row level security;

create policy "achievements readable by authenticated users" on public.achievements
  for select using (auth.uid() is not null);

create policy "admins manage achievements" on public.achievements
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
    )
  );

create table public.competencies (
  id                    text primary key,
  subject               text not null,
  skills                text[] not null default '{}',
  min_years_experience  int  not null default 0
);

alter table public.competencies enable row level security;

create policy "competencies readable by authenticated users" on public.competencies
  for select using (auth.uid() is not null);

create policy "admins manage competencies" on public.competencies
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
    )
  );

-- ------------------------------- storage -----------------------------------
-- Private bucket; downloads go through signed URLs granted by these rules.

insert into storage.buckets (id, name, public)
values ('resources', 'resources', false)
on conflict (id) do nothing;

-- Trainers write inside their own folder: resources/<trainer_id>/...
create policy "trainers upload to own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'resources'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "trainers update own files" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'resources'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "trainers delete own files" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'resources'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Published resources readable by any authenticated user; trainers and
-- admins can always read their own folder contents.
create policy "read published resources" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'resources'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.resources r
        join public.modules m on m.id = r.module_id
        join public.courses c on c.id = m.course_id
        where r.ref = name and r.published = true and c.status = 'published'
      )
    )
  );
