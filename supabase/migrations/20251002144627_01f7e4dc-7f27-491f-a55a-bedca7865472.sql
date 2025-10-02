-- Set up cron job to fetch trends every 3 hours
SELECT cron.schedule(
  'fetch-trends-job',
  '0 */3 * * *', -- Every 3 hours
  $$
  SELECT
    net.http_post(
        url:='https://owbdprrjmzwqajhyynrn.supabase.co/functions/v1/fetch-trends',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YmRwcnJqbXp3cWFqaHl5bnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDEwMDUsImV4cCI6MjA3NDAxNzAwNX0.tYxf4y1Ml2Xe1-7d_JP3gyM9YjIP-T3i21wWhdguaHQ"}'::jsonb,
        body:=concat('{"scheduled": true, "timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Set up cron job to cleanup expired data daily at 2 AM
SELECT cron.schedule(
  'cleanup-expired-data-job',
  '0 2 * * *', -- Daily at 2 AM
  $$
  SELECT
    net.http_post(
        url:='https://owbdprrjmzwqajhyynrn.supabase.co/functions/v1/cleanup-expired-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YmRwcnJqbXp3cWFqaHl5bnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDEwMDUsImV4cCI6MjA3NDAxNzAwNX0.tYxf4y1Ml2Xe1-7d_JP3gyM9YjIP-T3i21wWhdguaHQ"}'::jsonb,
        body:=concat('{"scheduled": true, "timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);