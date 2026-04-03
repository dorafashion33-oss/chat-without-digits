import { Camera, Bell, Shield, HelpCircle, Moon, Sun, Globe, User, Lock, ArrowLeft, LogOut, Search, Users, Plus, Image, X, Phone, Video } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { NavSection } from "./NavIconBar";
import type { DbProfile } from "@/hooks/useRealtimeMessages";
import type { Moment } from "@/hooks/useMoments";
import type { Group } from "@/hooks/useGroups";
import buzzLogo from "@/assets/buzz-logo.jpeg";

interface SectionPanelProps {
  section: NavSection;
  onBack?: () => void;
  username?: string;
  currentUserId?: string;
  onStartChat?: (userId: string) => void;
  moments?: Moment[];
  onPostMoment?: (text: string, imageFile?: File) => void;
  onDeleteMoment?: (id: string) => void;
  groups?: Group[];
  onCreateGroup?: (name: string, description: string, memberIds: string[]) => void;
  onSelectGroup?: (groupId: string) => void;
  onStartCall?: (userId: string, type: "voice" | "video") => void;
}

const SectionPanel = ({ section, onBack, username, currentUserId, onStartChat, moments, onPostMoment, onDeleteMoment, groups, onCreateGroup, onSelectGroup, onStartCall }: SectionPanelProps) => {
  switch (section) {
    case "moments":
      return <MomentsPanel onBack={onBack} currentUserId={currentUserId} moments={moments} onPostMoment={onPostMoment} onDeleteMoment={onDeleteMoment} username={username} />;
    case "connect":
      return <ConnectPanel onBack={onBack} onStartChat={onStartChat} onStartCall={onStartCall} />;
    case "discover":
      return <DiscoverPanel onBack={onBack} onStartChat={onStartChat} onStartCall={onStartCall} />;
    case "settings":
      return <SettingsPanel onBack={onBack} />;
    case "profile":
      return <ProfilePanel onBack={onBack} username={username} />;
    default:
      return null;
  }
};

/* ─── Moments ─── */
const STICKERS = ["😍", "🔥", "💯", "🎉", "❤️", "🥳", "✨", "💪", "😂", "🙌", "💜", "⚡"];
const BG_COLORS = [
  "bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400",
  "bg-gradient-to-br from-pink-500 via-red-500 to-orange-400",
  "bg-gradient-to-br from-green-500 via-teal-500 to-blue-500",
  "bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500",
  "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500",
  "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600",
  "bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600",
  "bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600",
];
const TEXT_STYLES: { label: string; className: string }[] = [
  { label: "Normal", className: "text-base font-normal" },
  { label: "Bold", className: "text-lg font-bold" },
  { label: "Italic", className: "text-base italic" },
  { label: "Heading", className: "text-2xl font-extrabold" },
  { label: "Script", className: "text-xl font-serif italic" },
];

const MomentsPanel = ({ onBack, currentUserId, moments = [], onPostMoment, onDeleteMoment, username }: {
  onBack?: () => void; currentUserId?: string; moments?: Moment[];
  onPostMoment?: (text: string, imageFile?: File) => void; onDeleteMoment?: (id: string) => void;
  username?: string;
}) => {
  const [showCompose, setShowCompose] = useState(false);
  const [momentText, setMomentText] = useState("");
  const [momentImage, setMomentImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [viewingMoment, setViewingMoment] = useState<Moment | null>(null);
  const [selectedBg, setSelectedBg] = useState(0);
  const [selectedTextStyle, setSelectedTextStyle] = useState(0);
  const [showStickers, setShowStickers] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const myMoments = moments.filter((m) => m.user_id === currentUserId);
  const otherMoments = moments.filter((m) => m.user_id !== currentUserId);

  const groupedByUser = new Map<string, Moment[]>();
  otherMoments.forEach((m) => {
    if (!groupedByUser.has(m.user_id)) groupedByUser.set(m.user_id, []);
    groupedByUser.get(m.user_id)!.push(m);
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large. Max 50MB allowed.");
      return;
    }
    setMomentImage(file);
    if (file.type.startsWith("video/")) {
      setImagePreview("video:" + URL.createObjectURL(file));
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handlePost = () => {
    if (!momentText.trim() && !momentImage) return;
    onPostMoment?.(momentText, momentImage || undefined);
    setMomentText("");
    setMomentImage(null);
    setImagePreview(null);
    setShowCompose(false);
    setSelectedBg(0);
    setSelectedTextStyle(0);
  };

  const timeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  // Viewing a moment fullscreen
  if (viewingMoment) {
    return (
      <div className="flex h-full flex-col bg-black animate-fade-in">
        <div className="flex items-center gap-3 px-4 py-3 bg-black/80 backdrop-blur-sm">
          <button onClick={() => setViewingMoment(null)} className="rounded-full p-1.5 hover:bg-white/10 transition-colors"><ArrowLeft className="h-5 w-5 text-white" /></button>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{viewingMoment.profile?.display_name || viewingMoment.profile?.username || username}</p>
            <p className="text-xs text-white/60">{timeAgo(viewingMoment.created_at)}</p>
          </div>
          {viewingMoment.user_id === currentUserId && onDeleteMoment && (
            <button onClick={() => { onDeleteMoment(viewingMoment.id); setViewingMoment(null); }} className="rounded-full p-2 hover:bg-white/10 transition-colors">
              <X className="h-4 w-4 text-white/70" />
            </button>
          )}
        </div>
        <div className="px-4 py-1">
          <div className="h-0.5 rounded-full bg-white/20">
            <div className="h-full w-full rounded-full bg-white/80 animate-[progress_5s_linear]" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-4 relative">
          {viewingMoment.image_url && (
            <img src={viewingMoment.image_url} alt="" className="max-h-[65vh] rounded-2xl object-contain" />
          )}
          {viewingMoment.text && (
            <div className={viewingMoment.image_url ? "absolute bottom-8 left-0 right-0 px-6" : ""}>
              <p className={`text-center ${viewingMoment.image_url ? "text-white text-lg font-medium drop-shadow-lg bg-black/50 rounded-xl p-4 backdrop-blur-sm" : "text-white text-2xl font-bold"}`}>
                {viewingMoment.text}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Compose with stickers, text styles, backgrounds
  if (showCompose) {
    return (
      <div className="flex h-full flex-col bg-chat-sidebar animate-fade-in">
        <div className="flex items-center gap-2 border-b px-5 py-3.5">
          <button onClick={() => { setShowCompose(false); setMomentImage(null); setImagePreview(null); setMomentText(""); setShowStickers(false); }} className="rounded-lg p-1 hover:bg-accent transition-colors"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-lg font-bold text-foreground">New Moment</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Preview area */}
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full rounded-2xl object-cover max-h-64" />
              <button onClick={() => { setMomentImage(null); setImagePreview(null); }} className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 hover:bg-black/80 transition-colors">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : momentText.trim() ? (
            <div className={`w-full rounded-2xl p-8 min-h-[180px] flex items-center justify-center ${BG_COLORS[selectedBg]}`}>
              <p className={`text-white text-center ${TEXT_STYLES[selectedTextStyle].className}`}>{momentText}</p>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-10 text-muted-foreground hover:border-primary hover:text-primary transition-all">
              <Image className="h-6 w-6" />
              <span className="text-sm font-medium">Add Photo / Video</span>
            </button>
          )}
          <input ref={fileRef} type="file" className="hidden" accept="image/*,video/*" onChange={handleImageSelect} />

          {/* Text input */}
          <textarea
            value={momentText}
            onChange={(e) => setMomentText(e.target.value)}
            placeholder="What's on your mind? ✨"
            className="w-full rounded-2xl bg-secondary p-4 text-sm outline-none placeholder:text-muted-foreground resize-none min-h-[80px] focus:ring-2 focus:ring-primary/20 transition-shadow"
          />

          {/* Background colors (only for text-only moments) */}
          {!imagePreview && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Background</p>
              <div className="flex gap-2 flex-wrap">
                {BG_COLORS.map((bg, i) => (
                  <button key={i} onClick={() => setSelectedBg(i)} className={`h-8 w-8 rounded-full ${bg} transition-all ${selectedBg === i ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"}`} />
                ))}
              </div>
            </div>
          )}

          {/* Text styles */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Text Style</p>
            <div className="flex gap-2 flex-wrap">
              {TEXT_STYLES.map((style, i) => (
                <button key={i} onClick={() => setSelectedTextStyle(i)} className={`px-3 py-1.5 rounded-xl text-xs transition-all ${selectedTextStyle === i ? "gradient-brand text-white shadow-sm" : "bg-secondary text-foreground hover:bg-accent"}`}>
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stickers */}
          <div>
            <button onClick={() => setShowStickers(!showStickers)} className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1 hover:text-foreground transition-colors">
              😊 Stickers {showStickers ? "▲" : "▼"}
            </button>
            {showStickers && (
              <div className="grid grid-cols-6 gap-2 bg-secondary rounded-2xl p-3">
                {STICKERS.map((s, i) => (
                  <button key={i} onClick={() => setMomentText((prev) => prev + s)} className="text-2xl h-10 w-10 flex items-center justify-center rounded-xl hover:bg-accent transition-colors hover:scale-110">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons row */}
          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
              <Image className="h-4 w-4" /> Photo
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
              <Camera className="h-4 w-4" /> Camera
            </button>
          </div>
        </div>
        <div className="border-t px-4 py-3">
          <button
            onClick={handlePost}
            disabled={!momentText.trim() && !momentImage}
            className="w-full rounded-2xl gradient-brand py-3.5 text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 transition-opacity shadow-sm"
          >
            Post Moment ✨
          </button>
        </div>
      </div>
    );
  }

  // List
  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b px-5 py-3.5 gradient-brand">
        <div className="flex items-center gap-2">
          {onBack && <button onClick={onBack} className="rounded-lg p-1 hover:bg-white/20 lg:hidden transition-colors"><ArrowLeft className="h-5 w-5 text-white" /></button>}
          <h1 className="text-lg font-bold text-white">Moments</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {/* My moment button */}
        <button onClick={() => setShowCompose(true)} className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-lg">
              {username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full gradient-brand text-white shadow-sm">
              <Plus className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">My Moment</p>
            <p className="text-xs text-muted-foreground">
              {myMoments.length > 0 ? `${myMoments.length} active · Tap to add` : "Tap to add · Disappears in 24h"}
            </p>
          </div>
        </button>

        {/* My active moments thumbnails */}
        {myMoments.length > 0 && (
          <div className="flex gap-2 px-3 mt-2 overflow-x-auto scrollbar-thin">
            {myMoments.map((m) => (
              <button key={m.id} onClick={() => setViewingMoment(m)} className="flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 border-primary relative hover:scale-105 transition-transform">
                {m.image_url ? <img src={m.image_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center bg-primary/15 text-[10px] text-center px-1 text-foreground">{m.text?.slice(0, 20)}</div>}
              </button>
            ))}
          </div>
        )}

        {/* Other users' moments */}
        {groupedByUser.size > 0 && (
          <>
            <p className="mt-5 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent</p>
            {Array.from(groupedByUser.entries()).map(([userId, userMoments]) => {
              const latest = userMoments[0];
              const profile = latest.profile;
              return (
                <button key={userId} onClick={() => setViewingMoment(latest)} className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60 mt-1">
                  <div className="h-14 w-14 rounded-full ring-2 ring-primary overflow-hidden flex-shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/15 text-primary font-bold text-lg">
                        {(profile?.display_name || profile?.username || "U")[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{profile?.display_name || profile?.username}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(latest.created_at)}</p>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {otherMoments.length === 0 && myMoments.length === 0 && (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <Camera className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No moments yet</p>
            <p className="text-xs mt-1">Be the first to share! ✨</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Connect (Calls) ─── */
const ConnectPanel = ({ onBack, onStartChat, onStartCall }: { onBack?: () => void; onStartChat?: (userId: string) => void; onStartCall?: (userId: string, type: "voice" | "video") => void }) => {
  const [allUsers, setAllUsers] = useState<DbProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      const { data } = await supabase.from("profiles").select("*");
      if (data) setAllUsers(data);
    })();
  }, []);

  const filtered = allUsers
    .filter((p) => p.user_id !== currentUserId)
    .filter((p) => !searchQuery || p.username.toLowerCase().includes(searchQuery.toLowerCase()) || (p.display_name || "").toLowerCase().includes(searchQuery.toLowerCase()));

  const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-violet-500", "bg-indigo-500", "bg-fuchsia-500"];

  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b gradient-brand px-5 py-3.5">
        <div className="flex items-center gap-2">
          {onBack && <button onClick={onBack} className="rounded-lg p-1 hover:bg-white/20 lg:hidden transition-colors"><ArrowLeft className="h-5 w-5 text-white" /></button>}
          <h1 className="text-lg font-bold text-white">Connect</h1>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Phone className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">No contacts found</p>
          </div>
        ) : (
          filtered.map((user) => {
            const ci = user.username.charCodeAt(0) % colors.length;
            const name = user.display_name || user.username;
            return (
              <div key={user.user_id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent/60 transition-colors">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={name} className="h-11 w-11 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full ${colors[ci]} text-xs font-semibold text-white flex-shrink-0`}>
                    {name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onStartCall?.(user.user_id, "voice")} className="rounded-full p-2 hover:bg-accent transition-colors" title="Voice call">
                    <Phone className="h-4 w-4 text-online" />
                  </button>
                  <button onClick={() => onStartCall?.(user.user_id, "video")} className="rounded-full p-2 hover:bg-accent transition-colors" title="Video call">
                    <Video className="h-4 w-4 text-primary" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* ─── Discover ─── */
const DiscoverPanel = ({ onBack, onStartChat, onStartCall }: { onBack?: () => void; onStartChat?: (userId: string) => void; onStartCall?: (userId: string, type: "voice" | "video") => void }) => {
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
    ? allUsers.filter((p) => p.user_id !== currentUserId && (p.username.toLowerCase().includes(searchQuery.toLowerCase()) || (p.display_name || "").toLowerCase().includes(searchQuery.toLowerCase())))
    : allUsers.filter((p) => p.user_id !== currentUserId);

  const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-violet-500", "bg-indigo-500", "bg-fuchsia-500", "bg-cyan-500", "bg-blue-600"];

  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b gradient-brand px-5 py-3.5">
        <div className="flex items-center gap-2">
          {onBack && <button onClick={onBack} className="rounded-lg p-1 hover:bg-white/20 lg:hidden transition-colors"><ArrowLeft className="h-5 w-5 text-white" /></button>}
          <h1 className="text-lg font-bold text-white">Discover</h1>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 transition-colors focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search by username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" autoFocus />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm font-medium">{searchQuery ? "No users found" : "No other users yet"}</p>
          </div>
        ) : (
          <div className="px-2">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{searchQuery ? "Results" : "All Users"} ({filtered.length})</p>
            {filtered.map((user) => {
              const ci = user.username.charCodeAt(0) % colors.length;
              const initials = (user.display_name || user.username).split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
              return (
                <button key={user.user_id} onClick={() => onStartChat?.(user.user_id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-accent">
                  <div className="relative flex-shrink-0">
                    {user.avatar_url ? <img src={user.avatar_url} alt={user.username} className="h-12 w-12 rounded-full object-cover" /> : <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors[ci]} text-sm font-semibold text-white`}>{initials}</div>}
                    {user.is_online && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-chat-sidebar bg-online" />}
                  </div>
                  <div className="text-left flex-1 min-w-0">
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
    { title: "Account", items: [
      { icon: User, label: "Account info", desc: "Username, profile details" },
      { icon: Lock, label: "Privacy", desc: "Last seen, profile photo" },
      { icon: Shield, label: "Security", desc: "Password, two-step verification" },
    ]},
    { title: "Preferences", items: [
      { icon: Bell, label: "Notifications", desc: "Message, group, call tones" },
      { icon: Globe, label: "Language", desc: "English" },
      { icon: HelpCircle, label: "Help", desc: "FAQs, contact us" },
    ]},
  ];

  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b gradient-brand px-5 py-3.5">
        <div className="flex items-center gap-2">
          {onBack && <button onClick={onBack} className="rounded-lg p-1 hover:bg-white/20 lg:hidden transition-colors"><ArrowLeft className="h-5 w-5 text-white" /></button>}
          <h1 className="text-lg font-bold text-white">Settings</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Theme toggle */}
        <div className="border-b px-4 py-3">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60">
            {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-primary" />}
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Theme</p>
              <p className="text-xs text-muted-foreground">{theme === "dark" ? "Switch to light" : "Switch to dark"}</p>
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
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
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
        {/* App info */}
        <div className="flex flex-col items-center py-6 text-muted-foreground/50">
          <img src={buzzLogo} alt="Buzz" className="h-8 w-8 rounded-lg object-cover opacity-40 mb-1" />
          <p className="text-[10px]">Buzz v1.0 · 2026</p>
        </div>
      </div>
    </div>
  );
};

/* ─── Profile ─── */
const ProfilePanel = ({ onBack, username }: { onBack?: () => void; username?: string }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [about, setAbout] = useState("Hey there! I'm using Buzz 💬");
  const [editingAbout, setEditingAbout] = useState(false);
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

  const handleSaveAbout = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ about }).eq("user_id", user.id);
      toast.success("About updated!");
    }
    setEditingAbout(false);
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("avatar_url, about").eq("user_id", user.id).single();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        if (data?.about) setAbout(data.about);
      }
    })();
  }, []);

  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b gradient-brand px-5 py-3.5">
        <div className="flex items-center gap-2">
          {onBack && <button onClick={onBack} className="rounded-lg p-1 hover:bg-white/20 lg:hidden transition-colors"><ArrowLeft className="h-5 w-5 text-white" /></button>}
          <h1 className="text-lg font-bold text-white">Profile</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex flex-col items-center py-8 px-4">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-28 w-28 rounded-full object-cover shadow-lg ring-4 ring-primary/20" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full gradient-brand text-4xl font-bold text-white shadow-lg glow-purple">
                {username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full gradient-brand text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50">
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>
          {uploading && <p className="mt-2 text-xs text-primary animate-pulse">Uploading...</p>}
          <h2 className="mt-4 text-xl font-bold text-foreground">{username || "User"}</h2>
          <p className="text-sm text-muted-foreground">@{username || "user"}</p>
        </div>
        <div className="px-5 space-y-4">
          <div className="rounded-2xl bg-accent/40 p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">About</p>
              <button onClick={() => editingAbout ? handleSaveAbout() : setEditingAbout(true)} className="text-xs text-primary font-medium hover:underline">
                {editingAbout ? "Save" : "Edit"}
              </button>
            </div>
            {editingAbout ? (
              <input value={about} onChange={(e) => setAbout(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSaveAbout()} className="w-full bg-transparent text-sm text-foreground outline-none border-b border-primary pb-1" autoFocus />
            ) : (
              <p className="text-sm text-foreground">{about}</p>
            )}
          </div>
          <div className="rounded-2xl bg-accent/40 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Username</p>
            <p className="text-sm font-medium text-foreground">@{username || "user"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionPanel;
