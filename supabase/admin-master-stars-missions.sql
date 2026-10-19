-- Garis Mimpi Admin Master: stars and missions
-- Run once in Supabase SQL Editor. Then add the first admin using the instructions below.
create table if not exists public.gm_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.gm_star_ledger (
  id uuid primary key default gen_random_uuid(),
  designer_id uuid not null references auth.users(id) on delete cascade,
  points integer not null check (points > 0 and points <= 1000),
  reason text not null,
  source text not null check (source in ('admin', 'mission')),
  source_ref text not null,
  awarded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (designer_id, source, source_ref)
);

create table if not exists public.gm_missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  period text not null check (period in ('daily', 'weekly')),
  stars integer not null check (stars > 0 and stars <= 1000),
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.gm_mission_completions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.gm_missions(id) on delete cascade,
  designer_id uuid not null references auth.users(id) on delete cascade,
  period_key text not null,
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  unique (mission_id, designer_id, period_key)
);

alter table public.gm_admins enable row level security;
alter table public.gm_star_ledger enable row level security;
alter table public.gm_missions enable row level security;
alter table public.gm_mission_completions enable row level security;

drop policy if exists "gm_admins_read_self" on public.gm_admins;
create policy "gm_admins_read_self" on public.gm_admins
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "gm_stars_read_self_or_admin" on public.gm_star_ledger;
create policy "gm_stars_read_self_or_admin" on public.gm_star_ledger
  for select to authenticated using (
    designer_id = auth.uid() or exists (
      select 1 from public.gm_admins a where a.user_id = auth.uid()
    )
  );

drop policy if exists "gm_stars_admin_insert" on public.gm_star_ledger;
create policy "gm_stars_admin_insert" on public.gm_star_ledger
  for insert to authenticated with check (
    exists (select 1 from public.gm_admins a where a.user_id = auth.uid())
    and awarded_by = auth.uid()
    and source = 'admin'
  );

drop policy if exists "gm_missions_read_authenticated" on public.gm_missions;
create policy "gm_missions_read_authenticated" on public.gm_missions
  for select to authenticated using (true);

drop policy if exists "gm_missions_admin_insert" on public.gm_missions;
create policy "gm_missions_admin_insert" on public.gm_missions
  for insert to authenticated with check (
    exists (select 1 from public.gm_admins a where a.user_id = auth.uid())
    and created_by = auth.uid()
  );

drop policy if exists "gm_missions_admin_update" on public.gm_missions;
create policy "gm_missions_admin_update" on public.gm_missions
  for update to authenticated using (
    exists (select 1 from public.gm_admins a where a.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.gm_admins a where a.user_id = auth.uid())
  );

drop policy if exists "gm_mission_completions_read_own_or_admin" on public.gm_mission_completions;
create policy "gm_mission_completions_read_own_or_admin" on public.gm_mission_completions
  for select to authenticated using (
    designer_id = auth.uid() or exists (
      select 1 from public.gm_admins a where a.user_id = auth.uid()
    )
  );

drop policy if exists "gm_mission_completions_submit_own" on public.gm_mission_completions;
create policy "gm_mission_completions_submit_own" on public.gm_mission_completions
  for insert to authenticated with check (
    designer_id = auth.uid() and status = 'submitted'
  );

drop policy if exists "gm_mission_completions_admin_update" on public.gm_mission_completions;
create policy "gm_mission_completions_admin_update" on public.gm_mission_completions
  for update to authenticated using (
    exists (select 1 from public.gm_admins a where a.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.gm_admins a where a.user_id = auth.uid())
  );

-- Award mission stars exactly once, only when an admin approves a completion.
create or replace function public.gm_award_mission_stars()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_record public.gm_missions%rowtype;
begin
  if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
    select * into mission_record
    from public.gm_missions
    where id = new.mission_id;

    if not found then
      raise exception 'Misi tidak ditemukan';
    end if;

    insert into public.gm_star_ledger
      (designer_id, points, reason, source, source_ref, awarded_by)
    values
      (new.designer_id, mission_record.stars,
       'Misi selesai: ' || mission_record.title, 'mission',
       new.mission_id::text || ':' || new.designer_id::text || ':' || new.period_key,
       new.reviewed_by)
    on conflict (designer_id, source, source_ref) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists gm_mission_approved_awards_stars on public.gm_mission_completions;
create trigger gm_mission_approved_awards_stars
after insert or update of status on public.gm_mission_completions
for each row execute function public.gm_award_mission_stars();

-- IMPORTANT: after running this script, add the first administrator manually:
-- 1. Supabase Dashboard > Authentication > Users; copy the admin account UUID.
-- 2. Run: insert into public.gm_admins (user_id) values ('PASTE-ADMIN-USER-UUID-HERE');
-- Never let the public client insert itself into gm_admins.
