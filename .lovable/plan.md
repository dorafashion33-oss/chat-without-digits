# Buzz Homepage Polish

## Goal
Refine the existing Buzz homepage into a more cohesive, professional product experience while preserving its warm cream palette, Indian identity, real Buzz interface previews, and working login/install flows.

## What will change
- Strengthen the opening section with clearer typography, better contrast, more intentional message overlays, and a visible cue to the next section.
- Refine the header and mobile menu so navigation and primary actions remain clear at every screen size.
- Improve the rhythm between sections with cleaner spacing, alternating layouts, and consistent editorial hierarchy.
- Polish the real Buzz Web, calls, Moments, messages, Nearby, privacy, groups, and install previews instead of adding decorative templates.
- Add restrained radiant edge effects and responsive motion to key text, imagery, controls, and interface previews.
- Preserve and extend `prefers-reduced-motion` behavior so all homepage motion becomes calm or static when requested.
- Verify desktop and mobile layouts, interactions, runtime behavior, and project health.

## Technical details
- Keep public navigation, authentication, and installation inside the existing `BuzzLanding` flow.
- Reuse semantic design tokens and existing button components; add only homepage-specific semantic tokens when necessary.
- Use Motion for React variants with reduced-motion branches rather than CSS-only animation that cannot be disabled reliably.
- Keep the current page content and actions functional; this is a visual and interaction polish, not a feature rewrite.
