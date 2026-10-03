# Architecture Rules

- Public marketing routes render through `BuzzLanding` and `BuzzPublicPage` so navigation, authentication, and installation stay consistent.
- PWA registration must remain centralized in `src/lib/registerSW.ts` and disabled in development and Lovable previews to prevent stale preview caches.
- App-wide reveal motion is centralized in `MotionFX` so dynamic screens share one reduced-motion-safe behavior.
- Direct and group message forwarding share `MessageForwardDialog` so destination selection and message provenance stay consistent across devices.