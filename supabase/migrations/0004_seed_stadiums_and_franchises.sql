INSERT INTO public.stadiums (
  slug,
  name,
  city,
  latitude,
  longitude,
  soil_type,
  straight_boundary_m,
  square_boundary_m,
  pace_wicket_pct,
  spin_wicket_pct,
  chase_win_pct,
  avg_first_innings_score
)
VALUES
  ('chepauk', 'M. A. Chidambaram Stadium', 'Chennai', 13.06280, 80.27930, 'Black & Red Clay • Grip & Turn', 76, 70, 44.00, 56.00, 46.00, 172),
  ('wankhede', 'Wankhede Stadium', 'Mumbai', 18.93890, 72.82580, 'Red Soil • High Carry & Swing', 72, 64, 68.00, 32.00, 67.00, 196),
  ('chinnaswamy', 'M. Chinnaswamy Stadium', 'Bengaluru', 12.97880, 77.59960, 'Two-Paced Subsurface • High Altitude', 68, 59, 64.00, 36.00, 71.00, 208),
  ('eden-gardens', 'Eden Gardens', 'Kolkata', 22.56460, 88.34330, 'Black Cotton Soil • Fast Outfield', 71, 66, 61.00, 39.00, 62.00, 191),
  ('sawai-mansingh', 'Sawai Mansingh Stadium', 'Jaipur', 26.89400, 75.80320, 'Alluvial Loam • Deep Boundaries', 78, 73, 52.00, 48.00, 58.00, 179),
  ('narendra-modi', 'Narendra Modi Stadium', 'Ahmedabad', 23.09170, 72.59750, 'Hybrid Red & Black Soil', 75, 68, 59.00, 41.00, 55.00, 188),
  ('ekana', 'BRSABV Ekana Cricket Stadium', 'Lucknow', 26.81140, 81.01690, 'Slow Black Clay • Low Bounce', 76, 71, 47.00, 53.00, 44.00, 168),
  ('arun-jaitley', 'Arun Jaitley Stadium', 'Delhi', 28.63790, 77.24320, 'Dry Loam • Compact Square', 68, 62, 56.00, 44.00, 60.00, 199),
  ('mullanpur', 'Maharaja Yadavindra Singh Stadium', 'Mohali', 30.77820, 76.73690, 'Firm Northern Clay • Seam Bounce', 74, 67, 66.00, 34.00, 54.00, 184),
  ('uppal', 'Rajiv Gandhi International Stadium', 'Hyderabad', 17.40650, 78.55050, 'Hard Flat Deck • High Scoring', 73, 66, 58.00, 42.00, 57.00, 204)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  soil_type = EXCLUDED.soil_type,
  straight_boundary_m = EXCLUDED.straight_boundary_m,
  square_boundary_m = EXCLUDED.square_boundary_m,
  pace_wicket_pct = EXCLUDED.pace_wicket_pct,
  spin_wicket_pct = EXCLUDED.spin_wicket_pct,
  chase_win_pct = EXCLUDED.chase_win_pct,
  avg_first_innings_score = EXCLUDED.avg_first_innings_score,
  updated_at = timezone('utc', now());

INSERT INTO public.franchises (
  code,
  name,
  city,
  primary_hex,
  secondary_hex,
  home_stadium_id
)
VALUES
  ('CSK', 'Chennai Super Kings', 'Chennai', '#d9a74a', '#1d428a', (SELECT id FROM public.stadiums WHERE slug = 'chepauk')),
  ('MI', 'Mumbai Indians', 'Mumbai', '#3b6ea5', '#c8b273', (SELECT id FROM public.stadiums WHERE slug = 'wankhede')),
  ('RCB', 'Royal Challengers Bengaluru', 'Bengaluru', '#b84242', '#c8b273', (SELECT id FROM public.stadiums WHERE slug = 'chinnaswamy')),
  ('KKR', 'Kolkata Knight Riders', 'Kolkata', '#6d4c9c', '#d4af37', (SELECT id FROM public.stadiums WHERE slug = 'eden-gardens')),
  ('RR', 'Rajasthan Royals', 'Jaipur', '#b85486', '#254aa5', (SELECT id FROM public.stadiums WHERE slug = 'sawai-mansingh')),
  ('GT', 'Gujarat Titans', 'Ahmedabad', '#4a6b82', '#c8b273', (SELECT id FROM public.stadiums WHERE slug = 'narendra-modi')),
  ('LSG', 'Lucknow Super Giants', 'Lucknow', '#3b6fb6', '#d97736', (SELECT id FROM public.stadiums WHERE slug = 'ekana')),
  ('DC', 'Delhi Capitals', 'Delhi', '#3b5998', '#c94a4a', (SELECT id FROM public.stadiums WHERE slug = 'arun-jaitley')),
  ('PBKS', 'Punjab Kings', 'Mohali', '#c2464c', '#d4be81', (SELECT id FROM public.stadiums WHERE slug = 'mullanpur')),
  ('SRH', 'Sunrisers Hyderabad', 'Hyderabad', '#cf6a38', '#222b30', (SELECT id FROM public.stadiums WHERE slug = 'uppal'))
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  primary_hex = EXCLUDED.primary_hex,
  secondary_hex = EXCLUDED.secondary_hex,
  home_stadium_id = EXCLUDED.home_stadium_id,
  updated_at = timezone('utc', now());