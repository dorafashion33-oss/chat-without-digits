import UserProfileDialog from "./UserProfileDialog";
import { enablePush, pushSupported } from "@/lib/push";
import {
  Camera,
  Bell,
  Shield,
  HelpCircle,
  Moon,
  Sun,
  Globe,
  User,
  Lock,
  ArrowLeft,
  LogOut,
  Search,
  Users,
  Plus,
  Image,
  X,
  Phone,
  Video,
  Send,
  Eye,
  PlayCircle,
  Palette,
  QrCode,
  Check,
  CheckCheck,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { NavSection } from "./NavIconBar";
import type { DbProfile } from "@/hooks/useRealtimeMessages";
import type { Moment } from "@/hooks/useMoments";
import type { Group } from "@/hooks/useGroups";
import buzzLogo from "@/assets/buzz-logo.jpeg";
import ChatThemesPanel from "./ChatThemesPanel";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

interface SectionPanelProps {
  section: NavSection;
  onBack?: () => void;
  username?: string;
  currentUserId?: string;
  onStartChat?: (userId: string) => void;
  moments?: Moment[];
  onPostMoment?: (text: string, imageFile?: File) => void;
  onDeleteMoment?: (id: string) => void;
  onRecordView?: (momentId: string) => void;
  groups?: Group[];
  onCreateGroup?: (name: string, description: string, memberIds: string[]) => void;
  onSelectGroup?: (groupId: string) => void;
  onStartCall?: (userId: string, type: "voice" | "video") => void;
}

const SectionPanel = ({
  section,
  onBack,
  username,
  currentUserId,
  onStartChat,
  moments,
  onPostMoment,
  onDeleteMoment,
  onRecordView,
  groups,
  onCreateGroup,
  onSelectGroup,
  onStartCall,
}: SectionPanelProps) => {
  switch (section) {
    case "moments":
      return (
        <MomentsPanel
          onBack={onBack}
          currentUserId={currentUserId}
          moments={moments}
          onPostMoment={onPostMoment}
          onDeleteMoment={onDeleteMoment}
          onRecordView={onRecordView}
          username={username}
        />
      );
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

const MomentsPanel = ({
  onBack,
  currentUserId,
  moments = [],
  onPostMoment,
  onDeleteMoment,
  onRecordView,
  username,
}: {
  onBack?: () => void;
  currentUserId?: string;
  moments?: Moment[];
  onPostMoment?: (text: string, imageFile?: File) => void;
  onDeleteMoment?: (id: string) => void;
  onRecordView?: (momentId: string) => void;
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
  const [showViewers, setShowViewers] = useState(false);
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
  };

  const handlePost = () => {
    if (!momentText.trim() && !momentImage) {
      toast.error("Please add text or an image/video");
      return;
    }
    onPostMoment?.(momentText, momentImage || undefined);
    setMomentText("");
    setMomentImage(null);
    setImagePreview(null);
    setShowCompose(false);
    toast.success("Moment posted! Active for 24 hours 🌟");
  };

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      {/* Top Bar */}
      <div className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-5 py-3.5 shadow-sm text-[#0a0a0a]">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h1 className="text-lg font-black text-[#0a0a0a]">Moments 📸</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 bz-grid-paper">
        {/* My Moment Trigger */}
        <div
          onClick={() => setShowCompose(true)}
          className="bz-card p-3.5 flex items-center gap-3 cursor-pointer hover:bg-[#FFF6B8]"
        >
          <div className="relative">
            <div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] font-black text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]">
              {username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border border-[#0a0a0a] bg-black text-white">
              <Plus className="h-3 w-3" />
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-[#0a0a0a]">My Moment</p>
            <p className="text-[11px] font-medium text-[#5b5b55]">
              {myMoments.length > 0 ? `${myMoments.length} active · Tap to add` : "Disappears in 24h · Tap to add"}
            </p>
          </div>
        </div>

        {/* My Active Moments Carousel */}
        {myMoments.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-1">
            {myMoments.map((m) => (
              <button
                key={m.id}
                onClick={() => setViewingMoment(m)}
                className="w-16 h-20 rounded-xl overflow-hidden border-2 border-[#0a0a0a] relative shrink-0 shadow-[0_2px_0_0_#0a0a0a] hover:scale-105 transition-transform"
              >
                {m.image_url ? (
                  <img src={m.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-[#FCE314] text-[10px] font-bold text-center px-1 text-[#0a0a0a]">
                    {m.text?.slice(0, 18)}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Other Users' Moments */}
        {groupedByUser.size > 0 && (
          <div>
            <p className="bz-label mb-2 px-1">Recent Updates</p>
            {Array.from(groupedByUser.entries()).map(([userId, userMoments]) => {
              const latest = userMoments[0];
              const profile = latest.profile;
              return (
                <div
                  key={userId}
                  onClick={() => setViewingMoment(latest)}
                  className="bz-card p-3 flex items-center gap-3 cursor-pointer hover:bg-white mb-2"
                >
                  <div className="h-11 w-11 rounded-xl border-2 border-[#0a0a0a] overflow-hidden shrink-0 shadow-[0_2px_0_0_#0a0a0a]">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center bg-[#E2ECFF] font-black text-[#0a0a0a]">
                        {profile?.display_name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-[#0a0a0a] truncate">
                      {profile?.display_name || profile?.username}
                    </p>
                    <p className="text-[10px] font-mono text-[#5b5b55]">
                      {new Date(latest.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compose Moment Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bz-card max-w-sm w-full p-5 bg-white shadow-[0_10px_0_0_#0a0a0a]">
            <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] pb-3 mb-4">
              <h2 className="text-sm font-black text-[#0a0a0a]">Create 24h Moment</h2>
              <button
                onClick={() => setShowCompose(false)}
                className="grid h-6 w-6 place-items-center rounded-lg border border-[#0a0a0a] bg-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <textarea
              value={momentText}
              onChange={(e) => setMomentText(e.target.value)}
              placeholder="What's happening? Share with friends..."
              maxLength={280}
              className="w-full h-24 p-3 rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] text-xs font-bold outline-none resize-none"
            />

            <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleImageSelect} className="hidden" />

            {imagePreview && (
              <div className="relative mt-2 rounded-xl border-2 border-[#0a0a0a] overflow-hidden h-28">
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => {
                    setMomentImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white text-[10px]"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="bz-btn bz-btn-white py-2 px-3 text-xs font-bold"
              >
                <Image className="h-3.5 w-3.5" /> Media
              </button>
              <button
                onClick={handlePost}
                className="bz-btn bz-btn-yellow flex-1 py-2 text-xs font-black uppercase"
              >
                Post Moment 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Moment Modal */}
      {viewingMoment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setViewingMoment(null)}
        >
          <div
            className="bz-card max-w-sm w-full overflow-hidden bg-black text-white border-4 border-white shadow-[0_8px_0_0_#ffffff]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/20">
              <span className="text-xs font-black">@{viewingMoment.profile?.username}</span>
              <button onClick={() => setViewingMoment(null)} className="text-sm font-bold">✕</button>
            </div>
            {viewingMoment.image_url ? (
              <img src={viewingMoment.image_url} alt="" className="w-full max-h-[350px] object-cover" />
            ) : (
              <div className="p-8 text-center text-sm font-bold bg-[#FCE314] text-[#0a0a0a] min-h-[220px] flex items-center justify-center">
                {viewingMoment.text}
              </div>
            )}
            {viewingMoment.text && viewingMoment.image_url && (
              <p className="p-3 text-xs bg-black/80 text-white font-medium">{viewingMoment.text}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Connect ─── */
const ConnectPanel = ({
  onBack,
  onStartChat,
  onStartCall,
}: {
  onBack?: () => void;
  onStartChat?: (userId: string) => void;
  onStartCall?: (userId: string, type: "voice" | "video") => void;
}) => {
  const [tab, setTab] = useState<"contacts" | "history">("contacts");
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<DbProfile[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("*").limit(30);
      if (data) setContacts(data);
    })();
  }, []);

  const filtered = contacts.filter((c) =>
    (c.display_name || c.username).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-5 py-3.5 shadow-sm text-[#0a0a0a]">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h1 className="text-lg font-black text-[#0a0a0a]">Connect & Calls 📞</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-[#0a0a0a] bg-white p-1 gap-1">
        <button
          onClick={() => setTab("contacts")}
          className={`flex-1 py-1.5 text-xs font-black rounded-lg border-2 transition-all ${
            tab === "contacts"
              ? "border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
              : "border-transparent text-[#5b5b55]"
          }`}
        >
          Contacts
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 py-1.5 text-xs font-black rounded-lg border-2 transition-all ${
            tab === "history"
              ? "border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
              : "border-transparent text-[#5b5b55]"
          }`}
        >
          Call History
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b-2 border-[#0a0a0a]/15 bg-white">
        <div className="flex items-center gap-2 rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] px-3 py-2 shadow-[0_2px_0_0_#0a0a0a]">
          <Search className="h-4 w-4 text-[#0a0a0a]/60" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold outline-none placeholder:text-[#0a0a0a]/40"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bz-grid-paper">
        {filtered.map((user) => (
          <div
            key={user.user_id}
            className="bz-card p-3 flex items-center justify-between hover:bg-[#FFF6B8]"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] gradient-brand text-xs font-black text-white shadow-[0_2px_0_0_#0a0a0a]">
                {(user.display_name || user.username).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black text-[#0a0a0a]">{user.display_name || user.username}</p>
                <p className="text-[10px] font-mono text-[#5b5b55]">@{user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onStartCall?.(user.user_id, "voice")}
                className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white hover:bg-[#FCE314] shadow-[0_2px_0_0_#0a0a0a]"
                title="Voice Call"
              >
                <Phone className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onStartCall?.(user.user_id, "video")}
                className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white hover:bg-[#FCE314] shadow-[0_2px_0_0_#0a0a0a]"
                title="Video Call"
              >
                <Video className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Discover ─── */
const DiscoverPanel = ({
  onBack,
  onStartChat,
  onStartCall,
}: {
  onBack?: () => void;
  onStartChat?: (userId: string) => void;
  onStartCall?: (userId: string, type: "voice" | "video") => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<DbProfile[]>([]);
  const [me, setMe] = useState<DbProfile | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [viewing, setViewing] = useState<DbProfile | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) setMe(data);
    })();
  }, []);

  useEffect(() => {
    const q = searchQuery.trim().replace(/^@/, "").replace(/[%_,()]/g, "");
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .limit(20);
      setResults((data || []).filter((p) => p.user_id !== me?.user_id));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, me?.user_id]);

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-5 py-3.5 shadow-sm text-[#0a0a0a]">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h1 className="text-lg font-black text-[#0a0a0a]">Discover People 🔍</h1>
        </div>
      </div>

      <div className="p-3 border-b-2 border-[#0a0a0a]/15 bg-white space-y-2">
        <div className="flex items-center gap-2 rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] px-3 py-2 shadow-[0_2px_0_0_#0a0a0a]">
          <Search className="h-4 w-4 text-[#0a0a0a]/60" />
          <input
            type="text"
            placeholder="Search unique @username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold outline-none"
          />
        </div>

        <button
          onClick={() => setShowQR(!showQR)}
          className="bz-btn bz-btn-white w-full py-1.5 text-xs font-bold"
        >
          <QrCode className="h-3.5 w-3.5" /> {showQR ? "Hide My QR" : "Show My Personal QR"}
        </button>
      </div>

      {showQR && me && (
        <div className="p-4 border-b-2 border-[#0a0a0a] bg-[#E2ECFF] flex flex-col items-center">
          <div className="rounded-2xl border-3 border-[#0a0a0a] bg-white p-4 shadow-[0_4px_0_0_#0a0a0a]">
            <QRCodeSVG value={`https://chat-without-digits.lovable.app/c/${me.username}`} size={140} level="H" />
          </div>
          <p className="mt-2 font-mono text-xs font-black text-[#0a0a0a]">@{me.username}</p>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bz-grid-paper">
        {results.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-[#5b5b55]">
            Search by typing at least 2 characters of a friend's @username.
          </div>
        ) : (
          results.map((profile) => (
            <div
              key={profile.user_id}
              onClick={() => setViewing(profile)}
              className="bz-card p-3 flex items-center justify-between cursor-pointer hover:bg-[#FFF6B8]"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] gradient-brand text-xs font-black text-white shadow-[0_2px_0_0_#0a0a0a]">
                  {(profile.display_name || profile.username).slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-black text-[#0a0a0a]">{profile.display_name || profile.username}</p>
                  <p className="text-[10px] font-mono text-[#5b5b55]">@{profile.username}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartChat?.(profile.user_id);
                }}
                className="bz-btn bz-btn-yellow px-3 py-1 text-xs font-black"
              >
                Chat
              </button>
            </div>
          ))
        )}
      </div>

      {viewing && (
        <UserProfileDialog
          profile={viewing}
          onClose={() => setViewing(null)}
          onMessage={(uid) => onStartChat?.(uid)}
          onCall={onStartCall}
        />
      )}
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

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-5 py-3.5 shadow-sm text-[#0a0a0a]">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h1 className="text-lg font-black text-[#0a0a0a]">Settings ⚙️</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bz-grid-paper">
        {/* Appearance Card */}
        <div
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="bz-card p-4 flex items-center justify-between cursor-pointer hover:bg-white"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] shadow-[0_2px_0_0_#0a0a0a]">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs font-black text-[#0a0a0a]">Theme Mode</p>
              <p className="text-[11px] text-[#5b5b55]">{theme === "dark" ? "Dark Active" : "Light Active"}</p>
            </div>
          </div>
          <span className="bz-btn bz-btn-white px-3 py-1 text-xs font-bold">Toggle</span>
        </div>

        {/* Guest Chat shortcut */}
        <a href="/guests" className="bz-card p-4 flex items-center justify-between hover:bg-white block">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#E2ECFF] shadow-[0_2px_0_0_#0a0a0a]">
              <Globe className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-xs font-black text-[#0a0a0a]">Guest Inbox</p>
              <p className="text-[11px] text-[#5b5b55]">Secret confessions & anonymous chats</p>
            </div>
          </div>
          <span className="text-lg font-black">›</span>
        </a>

        {/* Privacy Note */}
        <div className="rounded-2xl border-2 border-[#0a0a0a] bg-[#DCF4E4] p-4 shadow-[0_3px_0_0_#0a0a0a]">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-emerald-800" />
            <p className="text-xs font-black text-emerald-900">Zero Phone Number Guarantee</p>
          </div>
          <p className="text-[11px] text-[#2d5a3e] leading-relaxed">
            Buzz never collects, shares, or asks for your phone number. Your chats belong exclusively to you.
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bz-btn bz-btn-ink w-full py-3 text-xs font-black uppercase text-red-300 hover:text-red-100"
        >
          <LogOut className="h-4 w-4" /> Log Out of Buzz
        </button>

        <div className="pt-6 text-center text-[10px] font-mono text-[#5b5b55] font-bold">
          Buzz Messaging · Made in India 🇮🇳
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const urlWithCache = `${publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: urlWithCache }).eq("user_id", user.id);
      setAvatarUrl(urlWithCache);
      toast.success("Avatar updated! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAbout = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ about }).eq("user_id", user.id);
      toast.success("About updated!");
    }
    setEditingAbout(false);
  };

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("avatar_url, about").eq("user_id", user.id).single();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        if (data?.about) setAbout(data.about);
      }
    })();
  }, []);

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-5 py-3.5 shadow-sm text-[#0a0a0a]">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h1 className="text-lg font-black text-[#0a0a0a]">My Profile 👤</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bz-grid-paper">
        {/* Avatar Card */}
        <div className="bz-card p-6 flex flex-col items-center text-center shadow-[0_6px_0_0_#0a0a0a]">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-24 w-24 rounded-2xl border-3 border-[#0a0a0a] object-cover shadow-[0_4px_0_0_#0a0a0a]"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-3 border-[#0a0a0a] gradient-brand text-3xl font-black text-white shadow-[0_4px_0_0_#0a0a0a]">
                {username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>

          <h2 className="mt-4 text-lg font-black text-[#0a0a0a]">@{username || "user"}</h2>
          <span className="mt-1 inline-block rounded-full border border-[#0a0a0a] bg-[#DCF4E4] px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
            Verified Buzz Handle 🇮🇳
          </span>
        </div>

        {/* Bio Card */}
        <div className="bz-card p-4 shadow-[0_3px_0_0_#0a0a0a]">
          <div className="flex items-center justify-between mb-2">
            <span className="bz-label">About / Bio</span>
            <button
              onClick={() => (editingAbout ? handleSaveAbout() : setEditingAbout(true))}
              className="text-xs font-extrabold text-[#0a0a0a] underline"
            >
              {editingAbout ? "Save" : "Edit"}
            </button>
          </div>
          {editingAbout ? (
            <input
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveAbout()}
              className="w-full rounded-lg border-2 border-[#0a0a0a] bg-[#fffbec] p-2 text-xs font-bold outline-none"
              autoFocus
            />
          ) : (
            <p className="text-xs font-semibold text-[#0a0a0a]">{about}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionPanel;
