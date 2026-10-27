CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.stadiums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude NUMERIC(8, 5) NOT NULL,
  longitude NUMERIC(8, 5) NOT NULL,
  soil_type TEXT NOT NULL DEFAULT 'Red Soil',
  straight_boundary_m INTEGER NOT NULL DEFAULT 72,
  square_boundary_m INTEGER NOT NULL DEFAULT 65,
  pace_wicket_pct NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
  spin_wicket_pct NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
  chase_win_pct NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
  avg_first_innings_score INTEGER NOT NULL DEFAULT 180,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL CHECK (
    code IN ('CSK', 'MI', 'RCB', 'KKR', 'RR', 'GT', 'LSG', 'DC', 'PBKS', 'SRH')
  ),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  primary_hex TEXT NOT NULL,
  secondary_hex TEXT NOT NULL,
  logo_url TEXT,
  home_stadium_id UUID REFERENCES public.stadiums(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  account_tier TEXT NOT NULL DEFAULT 'FREE' CHECK (
    account_tier IN ('FREE', 'PRO', 'ADMIN')
  ),
  favorite_franchise_id UUID REFERENCES public.franchises(id) ON DELETE SET NULL,
  sound_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_api_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  franchise_id UUID NOT NULL REFERENCES public.franchises(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (
    role IN ('WK', 'BAT', 'ALL', 'BOWL')
  ),
  credits NUMERIC(4, 1) NOT NULL DEFAULT 8.0 CHECK (
    credits >= 4.0 AND credits <= 12.5
  ),
  batting_style TEXT,
  bowling_style TEXT,
  avatar_url TEXT,
  is_overseas BOOLEAN NOT NULL DEFAULT false,
  is_uncapped_debutant BOOLEAN NOT NULL DEFAULT false,
  selection_pct NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  recent_form_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  career_stats_3yr JSONB NOT NULL DEFAULT '{}'::jsonb,
  season_total_points NUMERIC(7, 2) NOT NULL DEFAULT 0.00,
  is_active_squad BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_franchises_home_stadium
  ON public.franchises(home_stadium_id);

CREATE INDEX IF NOT EXISTS idx_users_favorite_franchise
  ON public.users(favorite_franchise_id);

CREATE INDEX IF NOT EXISTS idx_players_franchise_id
  ON public.players(franchise_id);

CREATE INDEX IF NOT EXISTS idx_players_role
  ON public.players(role);

CREATE INDEX IF NOT EXISTS idx_players_credits
  ON public.players(credits);

CREATE INDEX IF NOT EXISTS idx_players_uncapped_debutant
  ON public.players(is_uncapped_debutant);

DROP TRIGGER IF EXISTS trg_stadiums_updated_at ON public.stadiums;
CREATE TRIGGER trg_stadiums_updated_at
  BEFORE UPDATE ON public.stadiums
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_franchises_updated_at ON public.franchises;
CREATE TRIGGER trg_franchises_updated_at
  BEFORE UPDATE ON public.franchises
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_players_updated_at ON public.players;
CREATE TRIGGER trg_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();