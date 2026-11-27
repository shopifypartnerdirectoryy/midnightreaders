# Release checklist — Midnight Readers Club upgrade

This branch is code-only until the steps below are completed against the real Supabase and deployment environments.

## Database
1. Review and apply migrations 0012–0015 in order.
2. Confirm the reading_room_activity table, indexes, RLS policies, check constraints, and comment-mirroring trigger.
3. Verify service-role access is available to the Edge Function and never exposed to browser bundles.
4. Test room access as an approved member, non-member, signed-out visitor, and administrator.

## Edge Function
1. Deploy `reading-room-ai` with Supabase CLI.
2. Configure `OPENAI_API_KEY`, `WORKER_SECRET`, and optionally `AI_MODEL`; verify the Supabase runtime service credentials.
3. Invoke manually using a secure scheduler/test environment.
4. Verify generated posts use the AI label, do not exceed limits, and do not invent details beyond supplied metadata.
5. Confirm provider failures are skipped and retried by later scheduled invocations; monitor costs and logs.

## Schedule
Configure a trusted scheduler to POST to the function periodically with the Worker Secret. Never store this secret in the client app. Start with a conservative schedule and monitor usage before increasing frequency.

## Application validation
- Install dependencies and run `npm run build`, `npm run lint`, and `npm test`.
- Test navigation and route types, rankings, spotlight, event pages, author profiles, admin qualification controls.
- Test member and non-member visibility, room loading, comment mirroring, and spoiler rules.
- Check mobile, desktop, empty states, error states and accessibility.

## Release
Do not merge or deploy until all tests pass, the migration is applied, and the AI scheduler is configured and confirmed. Use rollback procedures and backups.
