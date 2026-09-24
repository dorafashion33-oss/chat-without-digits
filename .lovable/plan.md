# Buzz Public Website and Login Redesign

## Goal
Replace the current standalone login screen with a complete, scrollable Buzz public website closely matching the structure, spacing, section order, and interaction style shown in the nine uploaded references, while keeping Buzz branding and its existing app features.

## What will change
- Build a sticky Buzz header with logo, feature links, privacy, help, business, Log In, and Download actions.
- Add a large photographic opening section with overlaid Buzz messaging UI and clear Log In/Download actions.
- Recreate the reference page flow: web calling, global private messaging statement, voice/video calls, desktop app, encryption, groups, and a multi-column footer.
- Use original Buzz visuals and generated Indian lifestyle photography rather than embedding the WhatsApp screenshots.
- Add a polished Buzz sign-in/sign-up dialog opened from the public page, retaining username-based authentication.
- Make Download open the existing install experience with QR and browser installation support.
- Keep authenticated users entering the existing Buzz chat app unchanged.
- Make the complete page adapt cleanly to mobile and desktop.

## Technical details
- Fix the existing authentication helper mismatch so username and email sign-in work.
- Refactor the install dialog so public-page buttons can open it directly.
- Add semantic landing-page color tokens and motion with reduced-motion support.
- Validate the public page, sign-in dialog, and mobile layout in the browser.
