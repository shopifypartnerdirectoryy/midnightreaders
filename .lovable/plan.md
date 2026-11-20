# Midnight Readers Club platform completion

## Goal
Bring the existing MRC application closer to the uploaded complete-platform brief without replacing working pages, accounts, books, or community features. Keep all public engagement truthful: activity, comments, votes, ratings, and rankings must come from real records; empty data stays empty.

## Work
1. **Correct existing integrity and brand gaps.** Remove simulated reader counts and generated bot comments from book pages; use genuine database activity only. Replace fixed poll percentages with real vote totals. Remove the remaining Fourth Group & Co. mention while preserving MRC branding and existing supplied titles.
2. **Complete book and author records.** Extend book submissions with distinct short description and full synopsis, richer author details and purchase links; add an author profile and book-management flow, submission preview before sending, and preserve review status and corrections for authors.
3. **Build genuine reader reviews and ratings.** Add one editable 1–5-star rating per member/book, written reviews, public distributions and summaries, helpful votes, and review reports, with authenticated ownership and database access rules.
4. **Add rankings and recognition.** Create public Top 10 Books and Top 10 Authors views based on genuine challenge-period engagement, publish the scoring method, and support eligible member voting, earned Early Author Spotlight, and official award publishing. Keep paid promotion separate from results.
5. **Finish membership administration and access controls.** Extend applications with the requested applicant and payment-verification details, statuses, search/filter, and administrative records. Preserve private receipt handling, external payment verification, manual approval, and unique MRC IDs; enforce approved-member access on all member-only participation paths.
6. **Make challenge and community programming manageable.** Add date-aware BOTM scheduling, events/activities, reading milestones, and admin controls so current and upcoming items are maintained in the app rather than hardcoded.
7. **Validate complete journeys.** Add targeted tests for ranking/eligibility and membership rules, run existing tests, and verify public discovery, book engagement, member participation, admin review, and mobile layouts. Record payment-provider and email-domain setup as external dependencies if still required.

## Technical approach
- Use additive database migrations and the existing browser client with row-level access controls; do not replace existing data or auth.
- Keep public shareable views at top-level routes and member-only pages under the existing authenticated layout.
- Use real stored records for all counts and rankings; do not seed fabricated activity or show simulated names as members.
- Use the existing Lovable Cloud storage flow for private payment proofs and appropriate cover/certificate assets; keep secrets and private receipts out of public pages.
- Preserve existing design tokens, shared navigation/footer, canonical book catalog, and current approved-membership workflow.

## External dependencies
Actual online payment collection and outbound email require provider/domain configuration; manual external-payment proof review remains available without either integration.