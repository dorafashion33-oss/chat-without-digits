import { Camera, Bell, Shield, HelpCircle, Moon, Sun, Globe, User, Lock, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, ArrowLeft, LogOut, Search, TrendingUp, Hash, Users, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { NavSection } from "./NavIconBar";

interface SectionPanelProps {
  section: NavSection;
  onBack?: () => void;
  username?: string;
}

const SectionPanel = ({ section, onBack, username }: SectionPanelProps) => {
  switch (section) {
    case "moments":
      return <MomentsPanel onBack={onBack} />;
    case "connect":
      return <ConnectPanel onBack={onBack} />;
    case "discover":
      return <DiscoverPanel onBack={onBack} />;
    case "settings":
      return <SettingsPanel onBack={onBack} />;
    case "profile":
      return <ProfilePanel onBack={onBack} username={username} />;
    default:
      return null;
  }
};

/* ─── Moments ─── */
const MomentsPanel = ({ onBack }: { onBack?: () => void }) => (
  <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0 animate-fade-in">
    <div className="border-b px-5 py-4" style={{ background: "linear-gradient(135deg, hsl(var(--brand-purple) / 0.1), hsl(var(--brand-magenta) / 0.1))" }}>
      <div className="flex items-center gap-2">
        {onBack && <button onClick={onBack} className="rounded-lg p-1 hover:bg-accent lg:hidden"><ArrowLeft className="h-5 w-5" /></button>}
        <h1 className="text-xl font-bold text-foreground">Moments</h1>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
      <div className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60 cursor-pointer">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-lg">Y</div>
          <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full gradient-brand text-white">
            <Camera className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">My Moment</p>
          <p className="text-xs text-muted-foreground">Tap to add a moment · 24h visibility</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2 px-3">
        {["Public", "Friends", "Custom"].map((p) => (
          <button key={p} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${p === "Friends" ? "gradient-brand text-white" : "bg-secondary text-muted-foreground hover:bg-accent"}`}>
            {p}
          </button>
        ))}
      </div>

      <p className="mt-5 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent Moments</p>
      {[
        { name: "Alex Rivers", avatar: "AR", time: "12 min ago", color: "bg-blue-500" },
        { name: "Maya Chen", avatar: "MC", time: "45 min ago", color: "bg-purple-500" },
        { name: "Zara Knight", avatar: "ZK", time: "2h ago", color: "bg-pink-500" },
        { name: "Leo Park", avatar: "LP", time: "5h ago", color: "bg-violet-500" },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60 cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ring-[2.5px] ring-primary ${s.color} text-sm font-semibold text-white`}>
            {s.avatar}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.time}</p>
          </div>
        </div>
      ))}

      <p className="mt-5 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Viewed</p>
      {[
        { name: "Sam Torres", avatar: "ST", time: "Yesterday", color: "bg-indigo-500" },
        { name: "Nina Patel", avatar: "NP", time: "Yesterday", color: "bg-fuchsia-500" },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60 cursor-pointer opacity-60">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-muted-foreground/30 ${s.color} text-sm font-semibold text-white`}>
            {s.avatar}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Connect ─── */
const ConnectPanel = ({ onBack }: { onBack?: () => void }) => {
  const callHistory = [
    { name: "Alex Rivers", avatar: "AR", color: "bg-blue-500", type: "outgoing" as const, callType: "video" as const, time: "Today, 2:30 PM" },
    { name: "Maya Chen", avatar: "MC", color: "bg-purple-500", type: "incoming" as const, callType: "voice" as const, time: "Today, 11:15 AM" },
    { name: "Zara Knight", avatar: "ZK", color: "bg-pink-500", type: "missed" as const, callType: "voice" as const, time: "Yesterday, 9:45 PM" },
    { name: "Leo Park", avatar: "LP", color: "bg-violet-500", type: "outgoing" as const, callType: "voice" as const, time: "Yesterday, 3:00 PM" },
    { name: "Sam Torres", avatar: "ST", color: "bg-indigo-500", type: "incoming" as const, callType: "video" as const, time: "Mon, 5:20 PM" },
  ];

  const CallIcon = ({ type }: { type: string }) => {
    if (type === "outgoing") return <PhoneOutgoing className="h-3.5 w-3.5 text-primary" />;
    if (type === "missed") return <PhoneMissed className="h-3.5 w-3.5 text-destructive" />;
    return <PhoneIncoming className="h-3.5 w-3.5 text-green-500" />;
  };

  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0 animate-fade-in">
      <div className="flex items-center justify-between border-b px-5 py-4" style={{ background: "linear-gradient(135deg, hsl(var(--brand-blue) / 0.1), hsl(var(--brand-purple) / 0.1))" }}>
        <div className="flex items-center gap-2">
          {onBack && <button onClick={onBack} className="rounded-lg p-1 hover:bg-accent lg:hidden"><ArrowLeft className="h-5 w-5" /></button>}
          <h1 className="text-xl font-bold text-foreground">Connect</h1>
        </div>
        <button className="rounded-full p-2 transition-colors hover:bg-accent">
          <Phone className="h-5 w-5 text-primary" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="border-b px-4 py-3">
          <p className="px-1 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Quick Dial</p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
            {[
              { name: "Alex", avatar: "AR", color: "bg-blue-500" },
              { name: "Maya", avatar: "MC", color: "bg-purple-500" },
              { name: "Zara", avatar: "ZK", color: "bg-pink-500" },
              { name: "Leo", avatar: "LP", color: "bg-violet-500" },
              { name: "Sam", avatar: "ST", color: "bg-indigo-500" },
            ].map((q, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer hover-scale">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${q.color} text-xs font-semibold text-white`}>
                  {q.avatar}
                </div>
                <span className="text-[11px] text-muted-foreground">{q.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-2">
          <p className="px-1 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Call Timeline</p>
          {callHistory.map((call, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60 cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${call.color} text-xs font-semibold text-white`}>
                {call.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${call.type === "missed" ? "text-destructive" : "text-foreground"}`}>{call.name}</p>
                <div className="flex items-center gap-1.5">
                  <CallIcon type={call.type} />
                  <span className="text-xs text-muted-foreground">{call.time}</span>
                </div>
              </div>
              <button className="rounded-full p-2 hover:bg-accent transition-colors">
                {call.callType === "video" ? (
                  <Video className="h-4 w-4 text-primary" />
                ) : (
                  <Phone className="h-4 w-4 text-primary" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Discover ─── */
const DiscoverPanel = ({ onBack }: { onBack?: () => void }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const trending = [
    { tag: "#BuzzUpdates", posts: "2.4K posts", icon: TrendingUp },
    { tag: "#TechTalk", posts: "1.8K posts", icon: Hash },
    { tag: "#DesignInspo", posts: "956 posts", icon: Sparkles },
  ];

  const suggestedUsers = [
    { name: "Sarah Kim", username: "sarah.design", avatar: "SK", color: "bg-pink-500", bio: "UI/UX Designer ✨" },
    { name: "Dev Patel", username: "dev.codes", avatar: "DP", color: "bg-blue-500", bio: "Full-stack developer 🚀" },
    { name: "Luna Rose", username: "luna.creates", avatar: "LR", color: "bg-violet-500", bio: "Digital artist 🎨" },
    { name: "Max Zhang", username: "max.tech", avatar: "MZ", color: "bg-indigo-500", bio: "Tech enthusiast 💻" },
  ];

  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b px-5 py-4" style={{ background: "linear-gradient(135deg, hsl(var(--brand-blue) / 0.1), hsl(var(--brand-magenta) / 0.1))" }}>
        <div className="flex items-center gap-2">
          {onBack && <button onClick={onBack} className="rounded-lg p-1 hover:bg-accent lg:hidden"><ArrowLeft className="h-5 w-5" /></button>}
          <h1 className="text-xl font-bold text-foreground">Discover</h1>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search people, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Trending */}
        <div className="px-4 py-2">
          <p className="px-1 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Trending Now</p>
          {trending.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60 cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.tag}</p>
                  <p className="text-xs text-muted-foreground">{item.posts}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggested */}
        <div className="px-4 py-2 border-t">
          <p className="px-1 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Suggested for You</p>
          {suggestedUsers.map((user, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60 cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${user.color} text-xs font-semibold text-white`}>
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">@{user.username} · {user.bio}</p>
              </div>
              <button className="rounded-full gradient-brand px-3 py-1.5 text-[11px] font-medium text-white hover:opacity-90 transition-opacity">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Settings ─── */
const SettingsPanel = ({ onBack }: { onBack?: () => void }) => {
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  };

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
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b px-5 py-4" style={{ background: "linear-gradient(135deg, hsl(var(--brand-purple) / 0.1), hsl(var(--brand-blue) / 0.1))" }}>
        <div className="flex items-center gap-2">
          {onBack && <button onClick={onBack} className="rounded-lg p-1 hover:bg-accent lg:hidden"><ArrowLeft className="h-5 w-5" /></button>}
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="border-b px-4 py-3">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60">
            {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-purple-500" />}
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
        <div className="px-4 py-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl p-3 text-destructive transition-colors hover:bg-destructive/10">
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-semibold">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Profile ─── */
const ProfilePanel = ({ onBack, username }: { onBack?: () => void; username?: string }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add cache buster
      const urlWithCache = `${publicUrl}?t=${Date.now()}`;

      await supabase.from("profiles").update({ avatar_url: urlWithCache }).eq("user_id", user.id);
      setAvatarUrl(urlWithCache);
      toast.success("Avatar updated! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  };

  // Load avatar on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("avatar_url").eq("user_id", user.id).single();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      }
    })();
  }, []);

  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b px-5 py-4" style={{ background: "linear-gradient(135deg, hsl(var(--brand-blue) / 0.1), hsl(var(--brand-magenta) / 0.1))" }}>
        <div className="flex items-center gap-2">
          {onBack && <button onClick={onBack} className="rounded-lg p-1 hover:bg-accent lg:hidden"><ArrowLeft className="h-5 w-5" /></button>}
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex flex-col items-center py-8">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-primary/20" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-brand text-3xl font-bold text-white shadow-lg glow-purple">
                {username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full gradient-brand text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>
          {uploading && <p className="mt-2 text-xs text-primary animate-pulse">Uploading...</p>}
          <h2 className="mt-3 text-lg font-bold text-foreground">{username || "User"}</h2>
          <p className="text-sm text-muted-foreground">@{username || "user"}</p>
        </div>
        <div className="px-5 space-y-4">
          {[
            { label: "About", value: "Hey there! I'm using Buzz 💬" },
            { label: "Phone", value: "+1 (555) 000-0000" },
            { label: "Username", value: `@${username || "user"}` },
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
};

export default SectionPanel;
