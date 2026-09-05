-- 이어(IEO): 병원 스냅샷 / 직접확인 / 이벤트
-- Dashboard SQL Editor에 붙여넣고 Run 해도 됩니다.

create table if not exists public.snapshots (
  id text primary key default 'current',
  generated_at timestamptz not null,
  source_date date not null,
  source text not null default '국가 공개 정보(건강보험심사평가원) 기반',
  updated_at timestamptz not null default now()
);

create table if not exists public.hospitals (
  ykiho text primary key,
  name text not null,
  cl_cd text not null,
  cl_cd_nm text not null,
  care_level smallint not null default 0,
  addr text not null default '',
  telno text,
  lat double precision,
  lng double precision,
  sggu_cd text not null,
  region_id text not null,
  region_label text not null,
  mri_count integer,
  has_mri boolean not null default true,
  has_ortho boolean,
  ortho_specialist_count integer,
  has_mri_nonpay boolean,
  status text not null check (status in ('high', 'unknown')),
  evidence_id text not null,
  evidence text not null,
  source_date date not null,
  mri_scope text,
  reservation_status text,
  confirmed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists hospitals_region_id_idx on public.hospitals (region_id);
create index if not exists hospitals_status_idx on public.hospitals (status);

create table if not exists public.app_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id text,
  event_name text not null,
  screen text,
  device text,
  os text,
  app_version text,
  props jsonb not null default '{}'::jsonb
);

create index if not exists app_events_created_at_idx on public.app_events (created_at desc);
create index if not exists app_events_name_idx on public.app_events (event_name);

alter table public.snapshots enable row level security;
alter table public.hospitals enable row level security;
alter table public.app_events enable row level security;

drop policy if exists "snapshots read" on public.snapshots;
create policy "snapshots read" on public.snapshots for select using (true);
drop policy if exists "snapshots write" on public.snapshots;
create policy "snapshots write" on public.snapshots for all using (true) with check (true);

drop policy if exists "hospitals read" on public.hospitals;
create policy "hospitals read" on public.hospitals for select using (true);
drop policy if exists "hospitals write" on public.hospitals;
create policy "hospitals write" on public.hospitals for all using (true) with check (true);

drop policy if exists "events insert" on public.app_events;
create policy "events insert" on public.app_events for insert with check (true);
drop policy if exists "events read" on public.app_events;
create policy "events read" on public.app_events for select using (true);

grant all on public.snapshots to anon, authenticated, service_role;
grant all on public.hospitals to anon, authenticated, service_role;
grant all on public.app_events to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
