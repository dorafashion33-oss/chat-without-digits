

## Buzz Mobile UX Overhaul Plan

### 1. Mobile Bottom Navigation Bar
- Create `src/components/chat/MobileBottomNav.tsx` — a fixed bottom bar visible only on mobile (`lg:hidden`)
- 4 tabs: Streams, Moments, Circles, Connect with colorful icons (each icon a different color — teal, orange, purple, blue)
- Active tab has filled background box effect with subtle scale animation
- Unread badge on Streams icon

### 2. Mobile Hamburger Menu (Settings & Profile)
- Add a hamburger menu button (3 lines) to the top-left of mobile screens
- Opens a slide-in drawer (using existing `vaul` Drawer component) with Settings and Profile options
- Include user avatar, username, dark mode toggle in the drawer

### 3. Username Onboarding Flow
- Create `src/components/chat/OnboardingFlow.tsx` — a multi-step intro screen
- Step 1: Welcome to Buzz splash with logo animation
- Step 2: Choose/type your username (with validation — min 3 chars, alphanumeric)
- Step 3: Quick feature tour (Streams, Moments, Circles, Connect cards)
- Store username in `localStorage`; show onboarding only on first visit
- After completion, navigate to main app

### 4. Colorful Theme & Animations
- Update icon colors in `NavIconBar.tsx` — each nav icon gets a distinct color (Streams=teal, Moments=orange, Circles=purple, Connect=blue)
- Add gradient backgrounds to section panel headers
- Add `animate-fade-in` to section panel content transitions
- Add pulse animation on unread badges
- Add slide-up animation for bottom nav appearance

### 5. Update Index.tsx Layout
- On mobile: hide left `NavIconBar`, show `MobileBottomNav` at bottom instead
- On mobile: add hamburger menu button in sidebar header for Settings/Profile access
- On desktop: keep existing left sidebar NavIconBar as-is
- Ensure all section switching works from both bottom nav (mobile) and left sidebar (desktop)

### Files to Create
- `src/components/chat/MobileBottomNav.tsx` — bottom tab bar
- `src/components/chat/OnboardingFlow.tsx` — username + intro flow

### Files to Edit
- `src/pages/Index.tsx` — integrate bottom nav, hamburger, onboarding gate
- `src/components/chat/NavIconBar.tsx` — colorful icons
- `src/components/chat/SectionPanel.tsx` — colorful headers, animations
- `src/components/chat/ChatSidebar.tsx` — add hamburger menu button on mobile
- `tailwind.config.ts` — add slide-up keyframe animation
- `src/index.css` — any new gradient/color utilities

