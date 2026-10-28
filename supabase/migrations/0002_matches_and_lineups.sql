CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_match_id TEXT UNIQUE,
  match_number INTEGER NOT NULL,
  season_year INTEGER NOT NULL DEFAULT 2026,
  home_franchise_id UUID NOT NULL REFERENCES public.franchises(id) ON DELETE RESTRICT,
  away_franchise_id UUID NOT NULL REFERENCES public.franchises(id) ON DELETE RESTRICT,
  venue_id UUID NOT NULL REFERENCES public.stadiums(id) ON DELETE RESTRICT,
  match_date DATE NOT NULL,
  start_time_utc TIMESTAMPTZ NOT NULL,
  is_day_match BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (
    status IN ('UPCOMING', 'TOSS_COMPLETED', 'LIVE', 'COMPLETED')
  ),
  toss_winner_franchise_id UUID REFERENCES public.franchises(id) ON DELETE SET NULL,
  toss_decision TEXT CHECK (
    toss_decision IN ('BAT', 'BOWL')
  ),
  playing_xi_confirmed BOOLEAN NOT NULL DEFAULT false,
  announced_xi_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  impact_sub_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  dew_index NUMERIC(5, 2) NOT NULL DEFAULT 50.00 CHECK (
    dew_index >= 0.00 AND dew_index <= 100.00
  ),
  par_score_projection INTEGER NOT NULL DEFAULT 185,
  live_score_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_dream_team_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT chk_distinct_match_franchises CHECK (home_franchise_id <> away_franchise_id)
);

CREATE TABLE IF NOT EXISTS public.fantasy_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_index INTEGER NOT NULL CHECK (
    team_index >= 1 AND team_index <= 30
  ),
  bucket_tier TEXT NOT NULL CHECK (
    bucket_tier IN ('Core', 'Form', 'Historic', 'Punt')
  ),
  lineup_status TEXT NOT NULL DEFAULT 'PROVISIONAL' CHECK (
    lineup_status IN ('PROVISIONAL', 'CONFIRMED_PLAYING')
  ),
  is_locked_core BOOLEAN NOT NULL DEFAULT false,
  captain_id UUID NOT NULL REFERENCES public.players(id) ON DELETE RESTRICT,
  vc_id UUID NOT NULL REFERENCES public.players(id) ON DELETE RESTRICT,
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_credits NUMERIC(4, 1) NOT NULL DEFAULT 100.0 CHECK (
    total_credits > 0.0 AND total_credits <= 100.0
  ),
  win_probability_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
  projected_points NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
  actual_points NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
  swap_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_match_team_index UNIQUE (match_id, team_index),
  CONSTRAINT chk_distinct_captain_vc CHECK (captain_id <> vc_id)
);

CREATE TABLE IF NOT EXISTS public.user_team_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.fantasy_teams(id) ON DELETE CASCADE,
  slot_number INTEGER NOT NULL CHECK (
    slot_number >= 1 AND slot_number <= 20
  ),
  is_core_shared BOOLEAN NOT NULL DEFAULT false,
  live_points NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
  live_rank INTEGER NOT NULL DEFAULT 1,
  previous_rank INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_user_match_team UNIQUE (user_id, match_id, team_id),
  CONSTRAINT uq_user_match_slot UNIQUE (user_id, match_id, slot_number)
);

CREATE INDEX IF NOT EXISTS idx_matches_match_date
  ON public.matches(match_date);

CREATE INDEX IF NOT EXISTS idx_matches_status
  ON public.matches(status);

CREATE INDEX IF NOT EXISTS idx_matches_venue_id
  ON public.matches(venue_id);

CREATE INDEX IF NOT EXISTS idx_fantasy_teams_match_id
  ON public.fantasy_teams(match_id);

CREATE INDEX IF NOT EXISTS idx_fantasy_teams_bucket_tier
  ON public.fantasy_teams(match_id, bucket_tier);

CREATE INDEX IF NOT EXISTS idx_fantasy_teams_locked_core
  ON public.fantasy_teams(match_id, is_locked_core);

CREATE INDEX IF NOT EXISTS idx_allocations_user_match
  ON public.user_team_allocations(user_id, match_id);

CREATE INDEX IF NOT EXISTS idx_allocations_match_team
  ON public.user_team_allocations(match_id, team_id);

DROP TRIGGER IF EXISTS trg_matches_updated_at ON public.matches;
CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_fantasy_teams_updated_at ON public.fantasy_teams;
CREATE TRIGGER trg_fantasy_teams_updated_at
  BEFORE UPDATE ON public.fantasy_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_allocations_updated_at ON public.user_team_allocations;
CREATE TRIGGER trg_allocations_updated_at
  BEFORE UPDATE ON public.user_team_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();