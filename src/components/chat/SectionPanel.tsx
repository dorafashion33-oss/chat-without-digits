import { Camera, Bell, Shield, HelpCircle, Moon, Sun, Globe, User, Lock, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, ArrowLeft, LogOut, Search, TrendingUp, Hash, Users, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { NavSection } from "./NavIconBar";
import type { DbProfile } from "@/hooks/useRealtimeMessages";

interface SectionPanelProps {
  section: NavSection;
  onBack?: () => void;
  username?: string;
  onStartChat?: (userId: string) => void;
}

const SectionPanel = ({ section, onBack, username, onStartChat }: SectionPanelProps) => {
  switch (section) {
    case "moments":
      return <MomentsPanel onBack={onBack} />;
    case "connect":
      return <ConnectPanel onBack={onBack} />;
    case "discover":
      return <DiscoverPanel onBack={onBack} onStartChat={onStartChat} />;
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

      <p className="mt-5 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent Moments</p>
      <div className="mt-2 flex flex-col items-center py-8 text-muted-foreground">
        <CircleDotIcon className="h-10 w-10 mb-2 opacity-30" />
        <p className="text-sm">No moments yet</p>
      </div>
    </div>
  </div>
);

const CircleDotIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="1" />
  </svg>
);

/* ─── Connect ─── */
const ConnectPanel = ({ onBack }: { onBack?: () => void }) => (
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
    <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col items-center justify-center text-muted-foreground py-16">
      <Phone className="h-10 w-10 mb-2 opacity-30" />
      <p className="text-sm">No call history</p>
      <p className="text-xs mt-1">Start a call from any chat</p>
    </div>
  </div>
);

/* ─── Discover (Real user search) ─── */
const DiscoverPanel = ({ onBack, onStartChat }: { onBack?: () => void; onStartChat?: (userId: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<DbProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      const { data } = await supabase.from("profiles").select("*");
      if (data) setAllUsers(data);
    })();
  }, []);

  const filtered = searchQuery.trim()
    ? allUsers.filter(
        (p) =>
          p.user_id !== currentUserId &&
          (p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.display_name || "").toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allUsers.filter((p) => p.user_id !== currentUserId);

  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-violet-500",
    "bg-indigo-500", "bg-fuchsia-500", "bg-cyan-500", "bg-blue-600",
  ];

  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b px-5 py-4" style={{ background: "linear-gradient(135deg, hsl(var(--brand-blue) / 0.1), hsl(var(--brand-magenta) / 0.1))" }}>
        <div className="flex items-center gap-2">
          {onBack && <button onClick={onBack} className="rounded-lg p-1 hover:bg-accent lg:hidden"><ArrowLeft className="h-5 w-5" /></button>}
          <h1 className="text-xl font-bold text-foreground">Discover</h1>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">{searchQuery ? "No users found" : "No other users yet"}</p>
          </div>
        ) : (
          <div className="px-2">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {searchQuery ? "Search Results" : "All Users"} ({filtered.length})
            </p>
            {filtered.map((user) => {
              const ci = user.username.charCodeAt(0) % colors.length;
              const initials = (user.display_name || user.username).split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
              return (
                <button
                  key={user.user_id}
                  onClick={() => onStartChat?.(user.user_id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-accent"
                >
                  <div className="relative">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors[ci]} text-sm font-semibold text-white`}>
                        {initials}
                      </div>
                    )}
                    {user.is_online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-chat-sidebar bg-online" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-foreground">{user.display_name || user.username}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                    {user.about && <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{user.about}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
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
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
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
