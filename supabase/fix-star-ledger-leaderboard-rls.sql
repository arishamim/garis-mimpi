-- Garis Mimpi: allow signed-in users to read the star ledger for public leaderboard totals.
-- The client only requests designer_id and points for the homepage leaderboard.
drop policy if exists "gm_stars_read_self_or_admin" on public.gm_star_ledger;
drop policy if exists "gm_stars_read_authenticated_leaderboard" on public.gm_star_ledger;
create policy "gm_stars_read_authenticated_leaderboard" on public.gm_star_ledger
  for select to authenticated using (true);
