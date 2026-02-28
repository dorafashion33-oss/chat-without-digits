import { CircleDot, Megaphone, Users, Image, Settings, User, Lock, Camera, Bell, Shield, HelpCircle, Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import type { NavSection } from "./NavIconBar";

interface SectionPanelProps {
  section: NavSection;
}

const SectionPanel = ({ section }: SectionPanelProps) => {
  switch (section) {
    case "status":
      return <StatusPanel />;
    case "channels":
      return <ChannelsPanel />;
    case "community":
      return <CommunityPanel />;
    case "media":
      return <MediaPanel />;
    case "settings":
      return <SettingsPanel />;
    case "profile":
      return <ProfilePanel />;
    default:
      return null;
  }
};

const StatusPanel = () => (
  <div className="flex h-full flex-col bg-chat-sidebar">
    <div className="border-b px-5 py-4">
      <h1 className="text-xl font-bold text-foreground">Status</h1>
    </div>
    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
      {/* My status */}
      <div className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60 cursor-pointer">
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">Y</div>
          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Camera className="h-3 w-3" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">My Status</p>
          <p className="text-xs text-muted-foreground">Tap to add status update</p>
        </div>
      </div>

      <p className="mt-4 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent updates</p>

      {[
        { name: "Alex Rivers", avatar: "AR", time: "12 min ago", color: "bg-primary" },
        { name: "Maya Chen", avatar: "MC", time: "45 min ago", color: "bg-emerald-500" },
        { name: "Zara Knight", avatar: "ZK", time: "2h ago", color: "bg-amber-500" },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60 cursor-pointer">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-primary ${s.color} text-sm font-semibold text-white`}>
            {s.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ChannelsPanel = () => (
  <div className="flex h-full flex-col bg-chat-sidebar">
    <div className="border-b px-5 py-4">
      <h1 className="text-xl font-bold text-foreground">Channels</h1>
    </div>
    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
      <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Your channels</p>
      {[
        { name: "Tech News", icon: "📰", members: 1240, desc: "Latest in technology" },
        { name: "Design Inspiration", icon: "🎨", members: 890, desc: "UI/UX design trends" },
        { name: "Dev Updates", icon: "🚀", members: 3400, desc: "Developer announcements" },
        { name: "Memes & Fun", icon: "😂", members: 5600, desc: "Just for laughs" },
      ].map((ch, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60 cursor-pointer">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl">
            {ch.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{ch.name}</p>
            <p className="text-xs text-muted-foreground truncate">{ch.desc}</p>
          </div>
          <span className="text-[10px] text-muted-foreground">{ch.members.toLocaleString()} members</span>
        </div>
      ))}
      <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
        <Megaphone className="h-4 w-4" /> Discover channels
      </button>
    </div>
  </div>
);

const CommunityPanel = () => (
  <div className="flex h-full flex-col bg-chat-sidebar">
    <div className="border-b px-5 py-4">
      <h1 className="text-xl font-bold text-foreground">Communities</h1>
    </div>
    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
      {[
        { name: "React Developers", icon: "⚛️", members: 12400, groups: 8 },
        { name: "UI/UX Designers", icon: "✨", members: 8900, groups: 5 },
        { name: "Startup Founders", icon: "💡", members: 3200, groups: 3 },
      ].map((c, i) => (
        <div key={i} className="mb-2 rounded-xl border border-border p-4 transition-colors hover:bg-accent/40 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-xl">{c.icon}</div>
            <div>
              <p className="text-sm font-semibold text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.members.toLocaleString()} members · {c.groups} groups</p>
            </div>
          </div>
        </div>
      ))}
      <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
        <Users className="h-4 w-4" /> Create a community
      </button>
    </div>
  </div>
);

const MediaPanel = () => (
  <div className="flex h-full flex-col bg-chat-sidebar">
    <div className="border-b px-5 py-4">
      <h1 className="text-xl font-bold text-foreground">Media</h1>
    </div>
    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
      <p className="px-1 pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Shared media</p>
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-accent flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
            <Image className="h-6 w-6 text-muted-foreground/50" />
          </div>
        ))}
      </div>
      <p className="mt-5 px-1 pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Documents</p>
      {["Project_Brief.pdf", "Design_System.fig", "Meeting_Notes.docx"].map((doc, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-accent/60 cursor-pointer transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{doc}</p>
            <p className="text-xs text-muted-foreground">{["1.2 MB", "4.5 MB", "256 KB"][i]}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SettingsPanel = () => {
  const { theme, setTheme } = useTheme();

  const settingGroups = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Account info", desc: "Name, phone, email" },
        { icon: Lock, label: "Privacy", desc: "Last seen, profile photo" },
        { icon: Shield, label: "Security", desc: "Two-step verification" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", desc: "Message, group, call tones" },
        { icon: Globe, label: "Language", desc: "English" },
        { icon: HelpCircle, label: "Help", desc: "FAQs, contact us" },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col bg-chat-sidebar">
      <div className="border-b px-5 py-4">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Theme toggle */}
        <div className="border-b px-4 py-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60"
          >
            {theme === "dark" ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Theme</p>
              <p className="text-xs text-muted-foreground">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
            </div>
          </button>
        </div>

        {settingGroups.map((group) => (
          <div key={group.title} className="border-b px-4 py-2">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{group.title}</p>
            {group.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={i} className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60">
                  <Icon className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfilePanel = () => (
  <div className="flex h-full flex-col bg-chat-sidebar">
    <div className="border-b px-5 py-4">
      <h1 className="text-xl font-bold text-foreground">Profile</h1>
    </div>
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {/* Avatar */}
      <div className="flex flex-col items-center py-8">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            Y
          </div>
          <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <h2 className="mt-3 text-lg font-bold text-foreground">You</h2>
        <p className="text-sm text-muted-foreground">@you</p>
      </div>

      {/* Info */}
      <div className="px-5 space-y-4">
        {[
          { label: "About", value: "Hey there! I'm using Buzz 💬" },
          { label: "Phone", value: "+1 (555) 000-0000" },
          { label: "Email", value: "you@example.com" },
        ].map((info, i) => (
          <div key={i} className="rounded-xl bg-accent/50 p-3.5">
            <p className="text-xs font-medium text-muted-foreground">{info.label}</p>
            <p className="mt-0.5 text-sm text-foreground">{info.value}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SectionPanel;
