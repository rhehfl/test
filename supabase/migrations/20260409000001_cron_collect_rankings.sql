-- pg_cron + pg_net 확장 필요 (Supabase 대시보드에서 활성화)
-- Database → Extensions → pg_cron, pg_net 활성화 후 실행

select cron.schedule(
  'collect-rankings',
  '0 19 * * *',  -- 매일 UTC 19:00 (KST 04:00)
  $$
    select net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/collect-rankings',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_key')
      ),
      body := '{}'::jsonb
    )
  $$
);
