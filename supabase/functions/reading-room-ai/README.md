# Reading-room AI worker

Deploy with Supabase CLI: `supabase functions deploy reading-room-ai`.

Set secrets (never expose them in client code): `supabase secrets set OPENAI_API_KEY=... WORKER_SECRET=... AI_MODEL=gpt-4o-mini`. The function also requires Supabase's `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` runtime values.

Schedule POST calls using Supabase Cron/pg_cron, an external scheduler, or an automation service with Authorization: Bearer WORKER_SECRET. A worker call is throttled to at most three AI posts per book per six-hour window; the function is intended to be invoked periodically. If quota/provider errors occur, it skips that book and tries on later runs (automatic retry on next scheduled run). AI activity is explicitly marked actor_type=ai and persona_key. This worker requires migration 0013 and the new 0014 migration. Do not configure a scheduler until secrets and migrations are deployed.
