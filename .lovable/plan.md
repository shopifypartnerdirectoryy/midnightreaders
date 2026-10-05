# Community Hub at `/community`

## Goal
Replace the temporary “coming soon” screen with a polished, active book-club hub modeled on the useful structure of Goodreads groups, while keeping Midnight Readers Club’s own visual identity.

## What I’ll build
- A full-width midnight reading-room banner with “The Midnight Readers,” group status, member count, active BOTM state, and Join Group / Group Rules actions.
- Working tabs for Overview, Discussions, BOTM & Polls, Buddy Reads, and Members.
- A responsive 70/30 desktop layout that becomes one column on mobile.
- Main area: current Book of the Month with reading progress, category-filtered discussions, and buddy-read matching cards.
- Sidebar: group rules, recent books, Spikes & Challenges, and online moderators.
- Useful interaction states: joining/sign-in routing, tab and feed filtering, rules panel, BOTM poll selection, and buddy-match actions.
- Purpose-built cover/banner imagery that fits the dark midnight, gold, and purple glass aesthetic.

## Data and behavior
- Use the existing signed-in account state and existing books/program data where available.
- Add only the minimal community records needed for durable membership, discussion, poll, and buddy-read interactions, protected so members manage their own activity and moderators/admins can manage the group.
- Seed the initial community view with clearly editorial MRC content; do not fabricate member activity or counts from fake accounts.
- Keep “10,240 Members” as the requested public group metadata, not a computed claim from fabricated profiles.

## Technical details
- Keep `/community` as the existing public TanStack route with unique social metadata.
- Reuse the established glass/button classes and semantic color tokens, extending tokens only where the darker community surface needs it.
- Use existing local book covers plus one generated banner asset; no hotlinked imagery.
- Add keyboard-accessible tabs, filters, dialogs, and clear signed-out states.
- Verify desktop and mobile layouts, tab/filter/join flows, current build status, and page console output.
