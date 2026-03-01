

## Buzz – Unified App Restructure Plan

This is a major restructure to rename navigation sections to match the Buzz product spec (Streams, Moments, Circles, Connect) and build out proper content panels for each section.

### Changes Overview

#### 1. Rename Navigation System
- **NavIconBar.tsx**: Rename nav items to match Buzz terminology:
  - Chat → **Streams** (icon: MessageCircle)
  - Status → **Moments** (icon: CircleDot)
  - Channels → removed (merged into Circles)
  - Community → **Circles** (icon: Users)
  - Media → removed
  - Settings → **Settings** (keep)
  - Profile → **Profile** (keep)
- Add **Connect** (Phone icon) as a new nav item for calls
- Update `NavSection` type accordingly

#### 2. Update Index.tsx
- Update `NavSection` type references and logic to use new section names
- `"streams"` replaces `"chat"` as the default/chat section

#### 3. Rebuild SectionPanel.tsx
- **Moments Panel**: My Moment with camera button, Recent Moments list with ring indicators, Viewed Moments section, privacy toggle (Public/Friends/Custom)
- **Circles Panel**: Community Hub with sub-groups, announcement channels, topic-based rooms, create community button
- **Connect Panel**: Voice/Video call tabs, call timeline/history, quick dial suggestions with avatars, incoming call UI placeholder
- Keep existing Settings and Profile panels mostly as-is

#### 4. Update ChatSidebar.tsx (now "Streams")
- Add smart filter tabs at top: All | Personal | Groups | Unread
- Update header title from "Chats" to "Streams"
- Keep existing search, pinned chats, chat list functionality

#### 5. Update ChatWindow.tsx header
- Add Info icon button alongside existing Call/Video/More buttons (already has Phone + Video)

#### 6. Update EmptyChat.tsx
- Update welcome text to use Buzz/Streams terminology

### Files to Create/Edit
- **Edit**: `src/components/chat/NavIconBar.tsx` — new nav items + types
- **Edit**: `src/pages/Index.tsx` — update section type references
- **Edit**: `src/components/chat/SectionPanel.tsx` — rebuild Moments, Circles, Connect panels
- **Edit**: `src/components/chat/ChatSidebar.tsx` — rename to Streams, add filter tabs
- **Edit**: `src/components/chat/EmptyChat.tsx` — update copy

