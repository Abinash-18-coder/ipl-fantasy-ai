ALTER TABLE public.stadiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_team_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for stadiums" ON public.stadiums;
CREATE POLICY "Public read access for stadiums"
  ON public.stadiums
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read access for franchises" ON public.franchises;
CREATE POLICY "Public read access for franchises"
  ON public.franchises
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read access for players" ON public.players;
CREATE POLICY "Public read access for players"
  ON public.players
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read access for matches" ON public.matches;
CREATE POLICY "Public read access for matches"
  ON public.matches
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated members can view fantasy teams" ON public.fantasy_teams;
CREATE POLICY "Authenticated members can view fantasy teams"
  ON public.fantasy_teams
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view own team allocations" ON public.user_team_allocations;
CREATE POLICY "Users can view own team allocations"
  ON public.user_team_allocations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own team allocations" ON public.user_team_allocations;
CREATE POLICY "Users can insert own team allocations"
  ON public.user_team_allocations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own team allocations" ON public.user_team_allocations;
CREATE POLICY "Users can update own team allocations"
  ON public.user_team_allocations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);