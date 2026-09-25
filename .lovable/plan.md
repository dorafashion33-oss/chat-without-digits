# Buzz Website and Call Experience Polish

## Goal
Make the public Buzz website and call screens feel polished and complete on desktop and mobile, with subtle motion, real navigation, direct installation, and a working contact flow.

## What will change
- Add low-fade entrance effects, gentle image motion, and restrained interaction feedback throughout the public website and main app, while respecting reduced-motion settings.
- Remove For Business, Help Center, and the footer groups titled What We Do, Who We Are, Use Buzz, and Need Help.
- Keep only real destinations in navigation and add complete Features, Privacy, Buzz Web, Download, and Contact pages/views using Buzz’s actual interface previews.
- Add a Contact form addressed to `prasadprem904@gmail.com`, with validation, sending feedback, and email delivery once the sender domain is configured.
- Rebuild the Download dialog around the Buzz logo and a primary Install button that opens the browser’s native app-install prompt when supported, with clear platform instructions and QR fallback otherwise.
- Match voice and video call controls to the supplied reference: full-screen video, encrypted label, participant control, and a translucent bottom bar containing menu, video, microphone, and red end-call controls.
- Ensure every public section and control is present, readable, and usable on mobile—not merely hidden or reduced from desktop.

## Technical details
- Use the existing PWA manifest and guarded service-worker setup; native installation still depends on browser support and a published HTTPS origin.
- Use semantic design tokens and the existing Button component for all new controls.
- Implement public content as real React Router pages and link every retained navigation item to its destination.
- Contact delivery requires a verified sender domain owned by the project owner; the interface can be completed now, but live sending activates only after domain setup.
- Validate desktop and mobile navigation, install behavior, contact form states, call controls, tests, and preview build health.
