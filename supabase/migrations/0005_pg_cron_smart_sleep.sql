CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE IF NOT EXISTS public.cron_sync_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_mode TEXT NOT NULL CHECK (
    execution_mode IN ('SMART_SLEEP', 'ACTIVE_DISPATCH')
  ),
  active_match_count INTEGER NOT NULL DEFAULT 0,
  request_id BIGINT,
  target_url TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_cron_audit_executed_at
  ON public.cron_sync_audit_log(executed_at DESC);

ALTER TABLE public.cron_sync_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for cron audit log" ON public.cron_sync_audit_log;
CREATE POLICY "Public read access for cron audit log"
  ON public.cron_sync_audit_log
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.invoke_live_match_sync_if_active(
  app_base_url TEXT DEFAULT 'https://ipl-fantasy-ai.vercel.app'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_count INTEGER := 0;
  v_request_id BIGINT := NULL;
  v_endpoint TEXT;
BEGIN
  SELECT COUNT(*)
  INTO v_active_count
  FROM public.matches
  WHERE status IN ('LIVE', 'TOSS_COMPLETED')
     OR (
       status = 'UPCOMING'
       AND start_time_utc <= (timezone('utc', now()) + interval '45 minutes')
       AND start_time_utc >= (timezone('utc', now()) - interval '6 hours')
     );

  DELETE FROM public.cron_sync_audit_log
  WHERE id IN (
    SELECT id
    FROM public.cron_sync_audit_log
    ORDER BY executed_at DESC
    OFFSET 200
  );

  IF v_active_count = 0 THEN
    INSERT INTO public.cron_sync_audit_log (
      execution_mode,
      active_match_count,
      request_id,
      target_url
    )
    VALUES (
      'SMART_SLEEP',
      0,
      NULL,
      NULL
    );

    RETURN jsonb_build_object(
      'ok', true,
      'mode', 'SMART_SLEEP',
      'active_matches', 0,
      'executed_at_utc', timezone('utc', now())
    );
  END IF;

  v_endpoint := rtrim(app_base_url, '/') || '/api/cron/sync-live';

  SELECT net.http_post(
    url := v_endpoint,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-CricIntel-Trigger', 'pg_cron_smart_sleep'
    ),
    body := jsonb_build_object(
      'triggered_by', 'pg_cron',
      'active_match_count', v_active_count,
      'dispatched_at_utc', timezone('utc', now())
    )
  )
  INTO v_request_id;

  INSERT INTO public.cron_sync_audit_log (
    execution_mode,
    active_match_count,
    request_id,
    target_url
  )
  VALUES (
    'ACTIVE_DISPATCH',
    v_active_count,
    v_request_id,
    v_endpoint
  );

  RETURN jsonb_build_object(
    'ok', true,
    'mode', 'ACTIVE_DISPATCH',
    'active_matches', v_active_count,
    'pg_net_request_id', v_request_id,
    'target_url', v_endpoint,
    'executed_at_utc', timezone('utc', now())
  );
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobname = 'cricintel-live-score-smart-sync'
  ) THEN
    PERFORM cron.unschedule('cricintel-live-score-smart-sync');
  END IF;
END
$$;

SELECT cron.schedule(
  'cricintel-live-score-smart-sync',
  '* * * * *',
  $$SELECT public.invoke_live_match_sync_if_active('https://ipl-fantasy-ai.vercel.app');$$
);