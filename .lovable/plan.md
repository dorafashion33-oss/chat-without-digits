

## UI Enhancements for Buzz

### 1. Emoji Picker in Chat Input
- Install `emoji-mart` (or use a lightweight custom emoji grid)
- Add emoji button toggle in `ChatWindow.tsx` input area that opens a popover with emoji categories
- Insert selected emoji at cursor position in the input field

### 2. Typing Indicator
- Add a "typing..." animation (three bouncing dots) that appears in the chat area
- Simulate typing indicator when a message is sent (show for 1-2 seconds as a mock reply effect)
- Create a `TypingIndicator` component with CSS dot animation

### 3. Message Reactions
- Long-press or hover on a message bubble to show a quick-react bar (thumbs up, heart, laugh, etc.)
- Store reactions in the `Message` interface and display them as small badges below the bubble

### 4. Image/File Sharing UI
- Wire up the existing Paperclip button to open a file picker
- Show image previews inline in message bubbles
- Display file attachments as downloadable cards with file name/size

### 5. Voice Message Recording UI
- Add a microphone button that toggles with the send button when input is empty
- Show a recording indicator with duration timer (visual only, no actual recording backend)

### 6. Read Receipts & Delivery Animations
- Animate the check/double-check status icons when messages transition states
- Add subtle fade-in animation on new message bubbles

### 7. Dark Mode Toggle
- Add a theme toggle button in the sidebar header
- Wire up `next-themes` (already installed) to switch between light/dark

### 8. Chat Wallpaper / Background Pattern
- Add a subtle SVG pattern or gradient to the chat background area

### Implementation Order
1. Dark mode toggle (quick win, `next-themes` already installed)
2. Typing indicator component
3. Message bubble animations (fade-in on new messages)
4. Emoji picker (popover with emoji grid)
5. Image preview in messages (extend Message type + Paperclip button)
6. Message reactions
7. Voice message UI placeholder

