export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

export interface Chat {
  id: string;
  user: User;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned?: boolean;
}

const currentUser: User = {
  id: "me",
  username: "you",
  displayName: "You",
  avatar: "",
  isOnline: true,
};

export const users: User[] = [
  { id: "1", username: "alex.rivers", displayName: "Alex Rivers", avatar: "AR", isOnline: true },
  { id: "2", username: "maya.chen", displayName: "Maya Chen", avatar: "MC", isOnline: true },
  { id: "3", username: "sam.foster", displayName: "Sam Foster", avatar: "SF", isOnline: false, lastSeen: "2 hours ago" },
  { id: "4", username: "zara.knight", displayName: "Zara Knight", avatar: "ZK", isOnline: true },
  { id: "5", username: "leo.park", displayName: "Leo Park", avatar: "LP", isOnline: false, lastSeen: "Yesterday" },
  { id: "6", username: "nina.wells", displayName: "Nina Wells", avatar: "NW", isOnline: true },
  { id: "7", username: "dev.team", displayName: "Dev Team 🚀", avatar: "DT", isOnline: true },
  { id: "8", username: "kai.tanaka", displayName: "Kai Tanaka", avatar: "KT", isOnline: false, lastSeen: "30 min ago" },
];

export const chats: Chat[] = [
  {
    id: "c1", user: users[0], isPinned: true, unreadCount: 2,
    lastMessage: "Hey! Are you free for a call later?", lastMessageTime: "12:45 PM",
    messages: [
      { id: "m1", senderId: "1", text: "Hey! How's the project going?", timestamp: "12:30 PM", status: "read" },
      { id: "m2", senderId: "me", text: "Going great! Just finished the UI components.", timestamp: "12:32 PM", status: "read" },
      { id: "m3", senderId: "1", text: "That's awesome! Can I see a preview?", timestamp: "12:35 PM", status: "read" },
      { id: "m4", senderId: "me", text: "Sure, I'll share the link in a sec 🔗", timestamp: "12:38 PM", status: "read" },
      { id: "m5", senderId: "1", text: "Hey! Are you free for a call later?", timestamp: "12:45 PM", status: "delivered" },
    ],
  },
  {
    id: "c2", user: users[1], unreadCount: 0,
    lastMessage: "Thanks for the help! 🙏", lastMessageTime: "11:20 AM",
    messages: [
      { id: "m6", senderId: "2", text: "Can you help me debug this issue?", timestamp: "11:00 AM", status: "read" },
      { id: "m7", senderId: "me", text: "Of course! What's the error?", timestamp: "11:05 AM", status: "read" },
      { id: "m8", senderId: "2", text: "It's a TypeScript type mismatch in the auth module", timestamp: "11:08 AM", status: "read" },
      { id: "m9", senderId: "me", text: "Ah, try casting the user object with `as User`", timestamp: "11:15 AM", status: "read" },
      { id: "m10", senderId: "2", text: "Thanks for the help! 🙏", timestamp: "11:20 AM", status: "read" },
    ],
  },
  {
    id: "c3", user: users[2], unreadCount: 5,
    lastMessage: "Check out this design mockup I made", lastMessageTime: "Yesterday",
    messages: [
      { id: "m11", senderId: "3", text: "I've been working on the new dashboard design", timestamp: "Yesterday", status: "read" },
      { id: "m12", senderId: "3", text: "Check out this design mockup I made", timestamp: "Yesterday", status: "delivered" },
    ],
  },
  {
    id: "c4", user: users[3], unreadCount: 0,
    lastMessage: "See you at the meetup! 🎉", lastMessageTime: "Yesterday",
    messages: [
      { id: "m13", senderId: "me", text: "Are you going to the tech meetup tomorrow?", timestamp: "Yesterday", status: "read" },
      { id: "m14", senderId: "4", text: "Yes! I'm presenting a talk on React patterns", timestamp: "Yesterday", status: "read" },
      { id: "m15", senderId: "me", text: "That's great! I'll be there", timestamp: "Yesterday", status: "read" },
      { id: "m16", senderId: "4", text: "See you at the meetup! 🎉", timestamp: "Yesterday", status: "read" },
    ],
  },
  {
    id: "c5", user: users[4], unreadCount: 1,
    lastMessage: "The API integration is ready for review", lastMessageTime: "Mon",
    messages: [
      { id: "m17", senderId: "5", text: "The API integration is ready for review", timestamp: "Mon", status: "delivered" },
    ],
  },
  {
    id: "c6", user: users[5], unreadCount: 0,
    lastMessage: "Love the new feature! Ship it! 🚢", lastMessageTime: "Mon",
    messages: [
      { id: "m18", senderId: "me", text: "Just deployed the latest updates", timestamp: "Mon", status: "read" },
      { id: "m19", senderId: "6", text: "Love the new feature! Ship it! 🚢", timestamp: "Mon", status: "read" },
    ],
  },
  {
    id: "c7", user: users[6], unreadCount: 12, isPinned: true,
    lastMessage: "Sprint planning tomorrow at 10 AM", lastMessageTime: "Sun",
    messages: [
      { id: "m20", senderId: "7", text: "Sprint planning tomorrow at 10 AM", timestamp: "Sun", status: "delivered" },
    ],
  },
  {
    id: "c8", user: users[7], unreadCount: 0,
    lastMessage: "Great working with you on this!", lastMessageTime: "Sat",
    messages: [
      { id: "m21", senderId: "8", text: "The code review looks good 👍", timestamp: "Sat", status: "read" },
      { id: "m22", senderId: "me", text: "Thanks! Learned a lot from your feedback", timestamp: "Sat", status: "read" },
      { id: "m23", senderId: "8", text: "Great working with you on this!", timestamp: "Sat", status: "read" },
    ],
  },
];

export { currentUser };
