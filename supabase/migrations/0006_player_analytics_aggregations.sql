CREATE OR REPLACE VIEW public.v_player_analytics_summary
WITH (security_invoker = true)
AS
WITH parsed_stats AS (
  SELECT
    p.id,
    p.external_api_id,
    p.full_name,
    p.short_name,
    p.franchise_id,
    f.code AS franchise_code,
    f.name AS franchise_name,
    f.primary_hex AS franchise_primary_hex,
    p.role,
    p.credits,
    p.avatar_url,
    p.is_overseas,
    p.is_uncapped_debutant,
    p.selection_pct,
    p.recent_form_points,
    p.career_stats_3yr,
    p.season_total_points,
    p.is_active_squad,
    COALESCE((p.recent_form_points->>0)::numeric, 0) AS form_m1,
    COALESCE((p.recent_form_points->>1)::numeric, 0) AS form_m2,
    COALESCE((p.recent_form_points->>2)::numeric, 0) AS form_m3,
    COALESCE((p.recent_form_points->>3)::numeric, 0) AS form_m4,
    COALESCE((p.career_stats_3yr->'2024'->>'matches')::integer, 0)
      + COALESCE((p.career_stats_3yr->'2025'->>'matches')::integer, 0)
      + COALESCE((p.career_stats_3yr->'2026'->>'matches')::integer, 0) AS career_3yr_matches,
    COALESCE((p.career_stats_3yr->'2024'->>'runs')::integer, 0)
      + COALESCE((p.career_stats_3yr->'2025'->>'runs')::integer, 0)
      + COALESCE((p.career_stats_3yr->'2026'->>'runs')::integer, 0) AS career_3yr_runs,
    COALESCE((p.career_stats_3yr->'2024'->>'wickets')::integer, 0)
      + COALESCE((p.career_stats_3yr->'2025'->>'wickets')::integer, 0)
      + COALESCE((p.career_stats_3yr->'2026'->>'wickets')::integer, 0) AS career_3yr_wickets,
    ROUND(
      (
        COALESCE((p.career_stats_3yr->'2024'->>'strike_rate')::numeric, 0)
        + COALESCE((p.career_stats_3yr->'2025'->>'strike_rate')::numeric, 0)
        + COALESCE((p.career_stats_3yr->'2026'->>'strike_rate')::numeric, 0)
      ) / 3.0,
      2
    ) AS career_3yr_sr,
    ROUND(
      (
        COALESCE((p.career_stats_3yr->'2024'->>'economy')::numeric, 0)
        + COALESCE((p.career_stats_3yr->'2025'->>'economy')::numeric, 0)
        + COALESCE((p.career_stats_3yr->'2026'->>'economy')::numeric, 0)
      ) / 3.0,
      2
    ) AS career_3yr_economy,
    ROUND(
      (
        COALESCE((p.career_stats_3yr->'2024'->>'fantasy_points_avg')::numeric, 0)
        + COALESCE((p.career_stats_3yr->'2025'->>'fantasy_points_avg')::numeric, 0)
        + COALESCE((p.career_stats_3yr->'2026'->>'fantasy_points_avg')::numeric, 0)
      ) / 3.0,
      2
    ) AS career_3yr_fantasy_avg
  FROM public.players p
  INNER JOIN public.franchises f ON f.id = p.franchise_id
  WHERE p.is_active_squad = true
)
SELECT
  ps.id,
  ps.external_api_id,
  ps.full_name,
  ps.short_name,
  ps.franchise_id,
  ps.franchise_code,
  ps.franchise_name,
  ps.franchise_primary_hex,
  ps.role,
  ps.credits,
  ps.avatar_url,
  ps.is_overseas,
  ps.is_uncapped_debutant,
  ps.selection_pct,
  ps.recent_form_points,
  ps.career_stats_3yr,
  ps.season_total_points,
  ROUND((ps.form_m1 + ps.form_m2 + ps.form_m3 + ps.form_m4) / 4.0, 2) AS form_4m_avg,
  ROUND(ps.form_m4 - ps.form_m1, 2) AS form_momentum_delta,
  ROUND(
    ((ps.form_m1 + ps.form_m2 + ps.form_m3 + ps.form_m4) / 4.0)
    / NULLIF(ps.credits, 0),
    2
  ) AS points_per_credit,
  ps.career_3yr_matches,
  ps.career_3yr_runs,
  ps.career_3yr_wickets,
  ps.career_3yr_sr,
  ps.career_3yr_economy,
  ps.career_3yr_fantasy_avg,
  CASE
    WHEN ps.selection_pct >= 65.0 THEN 'Core'
    WHEN ps.is_uncapped_debutant = true OR ps.selection_pct < 20.0 THEN 'Punt'
    WHEN ((ps.form_m1 + ps.form_m2 + ps.form_m3 + ps.form_m4) / 4.0) >= ps.career_3yr_fantasy_avg THEN 'Form'
    ELSE 'Historic'
  END AS recommended_risk_bucket
FROM parsed_stats ps;

CREATE OR REPLACE VIEW public.v_franchise_analytics_rollup
WITH (security_invoker = true)
AS
SELECT
  v.franchise_code,
  v.franchise_name,
  v.franchise_primary_hex,
  COUNT(*)::integer AS squad_size,
  SUM(CASE WHEN v.is_overseas THEN 1 ELSE 0 END)::integer AS overseas_count,
  SUM(CASE WHEN v.is_uncapped_debutant THEN 1 ELSE 0 END)::integer AS uncapped_count,
  ROUND(AVG(v.credits), 2) AS avg_credits,
  ROUND(AVG(v.form_4m_avg), 2) AS avg_squad_form_pts,
  ROUND(MAX(v.points_per_credit), 2) AS top_value_roi
FROM public.v_player_analytics_summary v
GROUP BY v.franchise_code, v.franchise_name, v.franchise_primary_hex
ORDER BY avg_squad_form_pts DESC;

GRANT SELECT ON public.v_player_analytics_summary TO anon, authenticated;
GRANT SELECT ON public.v_franchise_analytics_rollup TO anon, authenticated;