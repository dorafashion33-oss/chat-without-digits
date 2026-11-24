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
  X,
  Phone,
  Video,
  Eye,
  Palette,
  QrCode,
  Check,
  Trash2,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  KeyRound,
  Edit2,
  Share2,
  Laptop,
  Smartphone,
  Radio,
  ShieldAlert,
} from "lucide-react";
import {
  getLinkedDevices,
  saveDevices,
  revokeDevice,
  revokeAllOtherDevices,
  performFullLogout,
  type BuzzDevice,
} from "@/lib/buzzConnect";
import { CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { NavSection } from "./NavIconBar";
import type { DbProfile } from "@/hooks/useRealtimeMessages";
import type { Moment } from "@/hooks/useMoments";
import type { Group } from "@/hooks/useGroups";
import ChatThemesPanel from "./ChatThemesPanel";
import { QRCodeSVG } from "qrcode.react";
import { getCallHistory, clearCallHistory, type CallLog } from "@/lib/callHistory";
import { setupAppPin } from "./AppLockDialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SectionPanelProps {
  section: NavSection;
  onBack?: () => void;
  username?: string;
  currentUserId?: string;
  onStartChat?: (userId: string) => void;
  moments: Moment[];
  onPostMoment: (text: string, mediaFile?: File) => Promise<boolean>;
  onDeleteMoment: (id: string) => void;
  onRecordView: (momentId: string) => void;
  groups?: Group[];
  onCreateGroup?: (name: string, description: string, memberIds: string[]) => void;
  onSelectGroup?: (groupId: string) => void;
  onStartCall?: (userId: string, type: "voice" | "video") => void;
}

/* ─── Reactive Language Hook ─── */
const useAppLanguage = () => {
  const [lang, setLang] = useState<string>(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("buzz-language") || "en";
  });

  useEffect(() => {
    const handler = () => {
      setLang(localStorage.getItem("buzz-language") || "en");
    };
    window.addEventListener("languagechange", handler);
    return () => window.removeEventListener("languagechange", handler);
  }, []);

  return lang;
};

const tr = (lang: string, en: string, hi: string) => (lang === "hi" ? hi : en);

/* ─── Local State Persistence Helpers ─── */
const useLocalToggle = (key: string, def = true) => {
  const [v, setV] = useState<boolean>(() => {
    const s = localStorage.getItem(key);
    return s === null ? def : s === "1";
  });
  useEffect(() => {
    localStorage.setItem(key, v ? "1" : "0");
  }, [key, v]);
  return [v, setV] as const;
};

const useLocalString = (key: string, def: string) => {
  const [v, setV] = useState<string>(() => localStorage.getItem(key) || def);
  useEffect(() => {
    localStorage.setItem(key, v);
  }, [key, v]);
  return [v, setV] as const;
};

/* ─── Tactile Toggle Component ─── */
const TactileToggleRow = ({
  label,
  desc,
  checked,
  onChange,
  enabledMsg,
  disabledMsg,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  enabledMsg?: string;
  disabledMsg?: string;
}) => (
  <div
    className="bz-card p-3 flex items-center justify-between cursor-pointer hover:bg-white active:scale-[0.99] transition-all"
    onClick={() => {
      const next = !checked;
      onChange(next);
      toast.success(`${label}: ${next ? (enabledMsg || "Enabled ✅") : (disabledMsg || "Disabled ⚪")}`);
    }}
  >
    <div className="text-left flex-1 pr-3">
      <p className="text-xs font-black text-[#0a0a0a]">{label}</p>
      {desc && <p className="text-[11px] text-[#5b5b55] font-medium">{desc}</p>}
    </div>
    <div
      className={`relative h-6 w-11 rounded-full border-2 border-[#0a0a0a] transition-colors ${
        checked ? "bg-[#FCE314]" : "bg-white"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full border-2 border-[#0a0a0a] transition-transform ${
          checked ? "translate-x-[22px] bg-[#0a0a0a]" : "translate-x-0.5 bg-white"
        }`}
      />
    </div>
  </div>
);

const SettingsSubHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <div className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-3.5 flex items-center gap-2">
    <button
      onClick={onBack}
      className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
    <h1 className="text-base font-black text-[#0a0a0a]">{title}</h1>
  </div>
);

/* ─── Main Section Router ─── */
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
      return <SettingsPanel onBack={onBack} username={username} />;
    case "settings":
      return <SettingsPanel onBack={onBack} username={username} />;
    case "profile":
      return <ProfilePanel onBack={onBack} username={username} />;
    default:
      return null;
  }
};

/* ─── Moments Panel with Full Working Story Viewer ─── */
const MomentsPanel = ({
  onBack,
  currentUserId,
  moments,
  onPostMoment,
  onDeleteMoment,
  onRecordView,
  username,
}: {
  onBack?: () => void;
  currentUserId?: string;
  moments: Moment[];
  onPostMoment: (text: string, mediaFile?: File) => Promise<boolean>;
  onDeleteMoment: (id: string) => void;
  onRecordView: (momentId: string) => void;
  username?: string;
}) => {
  const lang = useAppLanguage();
  const [newText, setNewText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const [viewingMoment, setViewingMoment] = useState<Moment | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePost = async () => {
    if (!newText.trim() && !mediaFile) return;
    setPosting(true);
    const ok = await onPostMoment(newText, mediaFile || undefined);
    if (ok) {
      setNewText("");
      setMediaFile(null);
      toast.success(tr(lang, "Moment shared! Disappears in 24 hours ⏱️", "मोमेंट शेयर हो गया! 24 घंटे में हट जाएगा ⏱️"));
    }
    setPosting(false);
  };

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-5 py-3.5 shadow-sm text-[#0a0a0a]">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h1 className="text-lg font-black text-[#0a0a0a]">{tr(lang, "Moments (24h) ⏱️", "मोमेंट्स (24 घंटे) ⏱️")}</h1>
        </div>
      </div>

      <div className="p-4 border-b-2 border-[#0a0a0a]/15 bg-white space-y-3">
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder={tr(lang, "Share what's on your mind...", "अपने विचार यहाँ साझा करें...")}
          className="w-full rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] p-3 text-xs font-semibold outline-none resize-none"
          rows={2}
        />
        <div className="flex items-center justify-between">
          <button
            onClick={() => fileRef.current?.click()}
            className="bz-btn bz-btn-white px-3 py-1.5 text-xs font-bold"
          >
            <Camera className="h-3.5 w-3.5" /> {mediaFile ? "Media Selected 📷" : tr(lang, "Attach Media", "फोटो जोड़ें")}
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setMediaFile(f);
            }}
          />
          <button
            onClick={handlePost}
            disabled={posting || (!newText.trim() && !mediaFile)}
            className="bz-btn bz-btn-yellow px-4 py-1.5 text-xs font-black disabled:opacity-50"
          >
            {posting ? tr(lang, "Sharing...", "शेयर हो रहा है...") : tr(lang, "Post Moment", "पोस्ट करें")}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bz-grid-paper">
        {moments.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-[#5b5b55]">
            {tr(lang, "No moments active yet. Be the first to share one!", "अभी कोई मोमेंट नहीं है। पहला मोमेंट शेयर करें!")}
          </div>
        ) : (
          moments.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                setViewingMoment(m);
                onRecordView(m.id);
              }}
              className="bz-card p-3 cursor-pointer hover:bg-white transition-all shadow-[0_3px_0_0_#0a0a0a]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#0a0a0a]">@{m.profile?.username || "user"}</span>
                <span className="text-[10px] font-mono text-[#5b5b55]">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {m.image_url && (
                <img src={m.image_url} alt="" className="w-full max-h-40 rounded-xl object-cover border-2 border-[#0a0a0a] mb-2" />
              )}
              {m.text && <p className="text-xs font-semibold text-[#0a0a0a]">{m.text}</p>}
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono font-bold text-[#5b5b55]">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {m.view_count || m.views?.length || 0} {tr(lang, "views", "देखा")}
                </span>
                <span className="text-blue-600 font-bold">{tr(lang, "Tap to view story ›", "स्टोरी देखें ›")}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {viewingMoment && (
        <Dialog open={!!viewingMoment} onOpenChange={() => setViewingMoment(null)}>
          <DialogContent className="max-w-sm overflow-hidden p-0 rounded-3xl border-4 border-[#0a0a0a] bg-white shadow-[0_10px_0_0_#0a0a0a]">
            <div className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] gradient-brand text-xs font-black text-white">
                  {(viewingMoment.profile?.display_name || viewingMoment.profile?.username || "U")[0]?.toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="text-xs font-black text-[#0a0a0a]">
                    @{viewingMoment.profile?.username || "user"}
                  </DialogTitle>
                  <p className="text-[9px] font-mono text-[#5b5b55]">
                    {new Date(viewingMoment.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingMoment(null)}
                className="grid h-7 w-7 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 bz-grid-paper space-y-3">
              {viewingMoment.image_url ? (
                <img
                  src={viewingMoment.image_url}
                  alt="Moment"
                  className="w-full max-h-[380px] rounded-2xl object-cover border-2 border-[#0a0a0a] shadow-[0_4px_0_0_#0a0a0a]"
                />
              ) : (
                <div className="min-h-[180px] flex items-center justify-center p-6 rounded-2xl border-2 border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] text-center font-black text-base shadow-[0_4px_0_0_#0a0a0a]">
                  {viewingMoment.text}
                </div>
              )}

              {viewingMoment.image_url && viewingMoment.text && (
                <p className="text-xs font-bold text-[#0a0a0a] bg-white p-2.5 rounded-xl border-2 border-[#0a0a0a]">
                  {viewingMoment.text}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t-2 border-[#0a0a0a]/15 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <Eye className="h-4 w-4" /> {viewingMoment.view_count || viewingMoment.views?.length || 0} Views
                </span>
                {viewingMoment.user_id === currentUserId && (
                  <button
                    onClick={() => {
                      onDeleteMoment(viewingMoment.id);
                      setViewingMoment(null);
                      toast.success(tr(lang, "Moment deleted", "मोमेंट हटा दिया गया"));
                    }}
                    className="flex items-center gap-1 text-red-600 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

/* ─── Connect Panel with Real Call Logs ─── */
const ConnectPanel = ({
  onBack,
  onStartCall,
}: {
  onBack?: () => void;
  onStartChat?: (userId: string) => void;
  onStartCall?: (userId: string, type: "voice" | "video") => void;
}) => {
  const lang = useAppLanguage();
  const [callHistory, setCallHistory] = useState<CallLog[]>(getCallHistory());

  useEffect(() => {
    const handleUpdate = () => setCallHistory(getCallHistory());
    window.addEventListener("buzz:call-history-updated", handleUpdate);
    return () => window.removeEventListener("buzz:call-history-updated", handleUpdate);
  }, []);

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-5 py-3.5 shadow-sm text-[#0a0a0a]">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h1 className="text-lg font-black text-[#0a0a0a]">{tr(lang, "Call Logs & History 📞", "कॉल इतिहास 📞")}</h1>
        </div>
        {callHistory.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Clear all call logs?")) clearCallHistory();
            }}
            className="text-[10px] font-black underline text-red-600"
          >
            {tr(lang, "Clear History", "इतिहास साफ़ करें")}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bz-grid-paper">
        {callHistory.length === 0 ? (
          <div className="bz-card p-6 text-center my-8">
            <PhoneCall className="h-8 w-8 mx-auto mb-2 text-[#0a0a0a]/40" />
            <p className="text-xs font-black text-[#0a0a0a]">{tr(lang, "No Call Records Yet", "कोई कॉल रिकॉर्ड नहीं है")}</p>
            <p className="text-[11px] text-[#5b5b55] mt-1">
              {tr(lang, "Calls made or received via Buzz WebRTC will appear here automatically.", "Buzz पर की गई कॉल यहाँ दिखाई देंगी।")}
            </p>
          </div>
        ) : (
          callHistory.map((c) => (
            <div key={c.id} className="bz-card p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] ${
                    c.direction === "missed" ? "bg-red-200" : "bg-[#DCF4E4]"
                  }`}
                >
                  {c.direction === "missed" ? (
                    <PhoneMissed className="h-4 w-4 text-red-700" />
                  ) : (
                    <PhoneIncoming className="h-4 w-4 text-emerald-800" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-[#0a0a0a]">@{c.username}</p>
                  <p className="text-[10px] font-mono text-[#5b5b55]">
                    {c.callType.toUpperCase()} · {new Date(c.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {c.duration > 0 ? ` (${c.duration}s)` : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onStartCall?.(c.userId, "voice")}
                  className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white shadow-[0_1px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
                  title="Voice Call Back"
                >
                  <Phone className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onStartCall?.(c.userId, "video")}
                  className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white shadow-[0_1px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
                  title="Video Call Back"
                >
                  <Video className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ─── Discover Panel ─── */
const DiscoverPanel = ({
  onBack,
  onStartChat,
  onStartCall,
}: {
  onBack?: () => void;
  onStartChat?: (userId: string) => void;
  onStartCall?: (userId: string, type: "voice" | "video") => void;
}) => {
  const lang = useAppLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<DbProfile[]>([]);
  const [me, setMe] = useState<DbProfile | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [viewing, setViewing] = useState<DbProfile | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
          <h1 className="text-lg font-black text-[#0a0a0a]">{tr(lang, "Discover People 🔍", "मित्र खोजें 🔍")}</h1>
        </div>
      </div>

      <div className="p-3 border-b-2 border-[#0a0a0a]/15 bg-white space-y-2">
        <div className="flex items-center gap-2 rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] px-3 py-2 shadow-[0_2px_0_0_#0a0a0a]">
          <Search className="h-4 w-4 text-[#0a0a0a]/60" />
          <input
            type="text"
            placeholder={tr(lang, "Search unique @username...", "यूज़रनेम खोजें (@username)...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold outline-none"
          />
        </div>

        <button
          onClick={() => setShowQR(!showQR)}
          className="bz-btn bz-btn-white w-full py-1.5 text-xs font-bold"
        >
          <QrCode className="h-3.5 w-3.5" /> {showQR ? tr(lang, "Hide My QR", "QR कोड छुपाएं") : tr(lang, "Show My Personal QR", "मेरा QR कोड दिखाएं")}
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

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bz-grid-paper">
        {results.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-[#5b5b55]">
            {tr(lang, "Search by typing at least 2 characters of a friend's @username.", "कम से कम 2 अक्षर लिखकर दोस्त का यूज़रनेम खोजें।")}
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
                {tr(lang, "Chat", "चैट")}
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

/* ─── Settings Panel ─── */
type SettingsView = "main" | "account" | "privacy" | "security" | "notifications" | "language" | "help" | "chat-themes" | "devices";

const SettingsPanel = ({ onBack, username }: { onBack?: () => void; username?: string }) => {
  const lang = useAppLanguage();
  const { theme, setTheme } = useTheme();
  const [view, setView] = useState<SettingsView>("main");

    const handleLogout = async () => {
    toast.success(tr(lang, "Logging out...", "लॉग आउट हो रहा है..."));
    await performFullLogout();
  };

  if (view === "account") return <AccountView onBack={() => setView("main")} />;
  if (view === "privacy") return <PrivacyView onBack={() => setView("main")} />;
  if (view === "security") return <SecurityView onBack={() => setView("main")} />;
  if (view === "devices") return <LinkedDevicesView onBack={() => setView("main")} username={username} />;
  if (view === "notifications") return <NotificationsView onBack={() => setView("main")} />;
  if (view === "language") return <LanguageView onBack={() => setView("main")} />;
  if (view === "help") return <HelpView onBack={() => setView("main")} />;
  if (view === "chat-themes") return <ChatThemesPanel onBack={() => setView("main")} />;
  
  const settingGroups = [
        {
      title: tr(lang, "Account & Security", "खाता और सुरक्षा"),
      items: [
        { icon: User, label: tr(lang, "Account Info", "खाता विवरण"), desc: tr(lang, "Username, display name, about", "यूज़रनेम, नाम, परिचय"), view: "account" as SettingsView },
        { icon: Laptop, label: tr(lang, "Linked Devices (Buzz Connect)", "लिंक्ड डिवाइसेस (Buzz Connect)"), desc: tr(lang, "Multi-device QR login & remote logout", "मल्टी-डिवाइस QR लॉगिन और रिमोट लॉगआउट"), view: "devices" as SettingsView },
        { icon: Lock, label: tr(lang, "Privacy", "गोपनीयता (Privacy)"), desc: tr(lang, "Last seen, read receipts, typing", "लास्ट सीन, ब्लू टिक, टाइपिंग"), view: "privacy" as SettingsView },
        { icon: Shield, label: tr(lang, "Security & PIN Lock", "सुरक्षा और पिन लॉक"), desc: tr(lang, "4-Digit PIN, app lock, password", "4-अंकों का पिन, ऐप लॉक, पासवर्ड"), view: "security" as SettingsView },
      ],
    },
    {
      title: tr(lang, "Preferences & Customization", "पसंद और कस्टमाइज़ेशन"),
      items: [
        { icon: Palette, label: tr(lang, "Chat Themes", "चैट थीम्स"), desc: tr(lang, "Buzz cream + 7 vibrant wallpapers", "क्रीमी लुक + 7 नए वॉलपेपर्स"), view: "chat-themes" as SettingsView },
        { icon: Bell, label: tr(lang, "Notifications", "नोटिफ़िकेशन"), desc: tr(lang, "Browser Web Push, tones, preview", "वेब पुश, रिंगटोन, प्रीव्यू"), view: "notifications" as SettingsView },
        { icon: Globe, label: tr(lang, "Language", "भाषा (Language)"), desc: tr(lang, "English / हिन्दी इंटरफ़ेस", "English / हिन्दी इंटरफ़ेस"), view: "language" as SettingsView },
        { icon: HelpCircle, label: tr(lang, "Help & FAQs", "सहायता और सवाल"), desc: tr(lang, "Guides, troubleshooting, contact", "गाइड्स, सहायता, संपर्क"), view: "help" as SettingsView },
      ],
    },
  ];

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
          <h1 className="text-lg font-black text-[#0a0a0a]">{tr(lang, "Settings ⚙️", "सेटिंग्स ⚙️")}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bz-grid-paper">
        <div
          onClick={() => {
            const next = theme === "dark" ? "light" : "dark";
            setTheme(next);
            toast.success(next === "dark" ? "Dark Mode Active 🌙" : "Light Mode Active ☀️");
          }}
          className="bz-card p-3.5 flex items-center justify-between cursor-pointer hover:bg-white"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] shadow-[0_2px_0_0_#0a0a0a]">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-xs font-black text-[#0a0a0a]">{tr(lang, "Theme Mode", "थीम मोड")}</p>
              <p className="text-[11px] text-[#5b5b55]">{theme === "dark" ? tr(lang, "Dark Active", "डार्क मोड") : tr(lang, "Light Active", "लाइट मोड")}</p>
            </div>
          </div>
          <span className="bz-btn bz-btn-white px-2.5 py-1 text-xs font-bold">{tr(lang, "Toggle", "बदलें")}</span>
        </div>

        <a href="/guests" className="bz-card p-3.5 flex items-center justify-between hover:bg-white block">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#E2ECFF] shadow-[0_2px_0_0_#0a0a0a]">
              <Globe className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <p className="text-xs font-black text-[#0a0a0a]">{tr(lang, "Guest Inbox", "गेस्ट इनबॉक्स")}</p>
              <p className="text-[11px] text-[#5b5b55]">{tr(lang, "Secret confessions & anonymous chats", "गुमनाम संदेश और सीक्रेट चैट")}</p>
            </div>
          </div>
          <span className="text-base font-black">›</span>
        </a>

        {settingGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5 pt-1">
            <p className="px-1 text-[10px] font-mono font-bold uppercase text-[#5b5b55]">{group.title}</p>
            {group.items.map((item, iIdx) => {
              const Icon = item.icon;
              return (
                <div
                  key={iIdx}
                  onClick={() => setView(item.view)}
                  className="bz-card p-3 flex items-center justify-between cursor-pointer hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white shadow-[0_1px_0_0_#0a0a0a]">
                      <Icon className="h-4 w-4 text-[#0a0a0a]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#0a0a0a]">{item.label}</p>
                      <p className="text-[10px] text-[#5b5b55] font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-[#0a0a0a]">›</span>
                </div>
              );
            })}
          </div>
        ))}

        <div className="rounded-2xl border-2 border-[#0a0a0a] bg-[#DCF4E4] p-3.5 shadow-[0_2px_0_0_#0a0a0a]">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-emerald-800" />
            <p className="text-xs font-black text-emerald-900">{tr(lang, "Zero Phone Number Guarantee", "फ़ोन नंबर से पूर्ण मुक्ति")}</p>
          </div>
          <p className="text-[11px] text-[#2d5a3e] leading-relaxed">
            {tr(
              lang,
              "Buzz never collects, shares, or asks for your phone number. Your chats belong exclusively to you.",
              "Buzz कभी भी आपका फ़ोन नंबर नहीं मांगता। आपकी पहचान केवल आपका यूज़रनेम है।"
            )}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bz-btn bz-btn-ink w-full py-3 text-xs font-black uppercase text-red-300 hover:text-red-100"
        >
          <LogOut className="h-4 w-4" /> {tr(lang, "Log Out of Buzz", "लॉग आउट करें")}
        </button>
      </div>
    </div>
  );
};

/* ─── Account View ─── */
const AccountView = ({ onBack }: { onBack: () => void }) => {
  const lang = useAppLanguage();
  const [profile, setProfile] = useState<{ username: string; display_name: string; about: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("username, display_name, about").eq("user_id", user.id).maybeSingle();
      if (data) {
        setProfile({
          username: data.username || "",
          display_name: data.display_name || "",
          about: data.about || "",
        });
      }
    })();
  }, []);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: profile.display_name, about: profile.about })
        .eq("user_id", user.id);
      if (error) toast.error(error.message);
      else toast.success(tr(lang, "Account updated successfully! 🎉", "खाता सफलतापूर्वक अपडेट हो गया! 🎉"));
    }
    setSaving(false);
  };

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <SettingsSubHeader title={tr(lang, "Account Info", "खाता विवरण")} onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bz-grid-paper">
        {!profile ? (
          <p className="text-xs text-[#5b5b55] font-bold">Loading profile...</p>
        ) : (
          <>
            <div className="bz-card p-3">
              <label className="text-[10px] font-mono font-bold text-[#5b5b55] uppercase">{tr(lang, "Permanent Username", "स्थायी यूज़रनेम")}</label>
              <input
                value={`@${profile.username}`}
                disabled
                className="mt-1 w-full rounded-lg border-2 border-[#0a0a0a] bg-[#fffbec]/50 px-3 py-2 text-xs font-black text-[#0a0a0a]"
              />
              <p className="text-[10px] text-[#5b5b55] mt-1 font-medium">{tr(lang, "Username acts as your immutable ID", "यूज़रनेम आपकी अपरिवर्तनीय पहचान है")}</p>
            </div>

            <div className="bz-card p-3">
              <label className="text-[10px] font-mono font-bold text-[#5b5b55] uppercase">{tr(lang, "Display Name", "प्रदर्शित नाम")}</label>
              <input
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                className="mt-1 w-full rounded-lg border-2 border-[#0a0a0a] bg-white px-3 py-2 text-xs font-bold text-[#0a0a0a] outline-none"
              />
            </div>

            <div className="bz-card p-3">
              <label className="text-[10px] font-mono font-bold text-[#5b5b55] uppercase">{tr(lang, "About / Bio", "परिचय (Bio)")}</label>
              <textarea
                value={profile.about}
                onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg border-2 border-[#0a0a0a] bg-white px-3 py-2 text-xs font-bold text-[#0a0a0a] outline-none resize-none"
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="bz-btn bz-btn-yellow w-full py-3 text-xs font-black uppercase disabled:opacity-50"
            >
              {saving ? tr(lang, "Saving...", "सेव हो रहा है...") : tr(lang, "Save Account Changes", "बदलाव सेव करें")}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Privacy View ─── */
const PrivacyView = ({ onBack }: { onBack: () => void }) => {
  const lang = useAppLanguage();
  const [lastSeen, setLastSeen] = useLocalToggle("buzz-privacy-last-seen", true);
  const [readReceipts, setReadReceipts] = useLocalToggle("buzz-privacy-read-receipts", true);
  const [typing, setTyping] = useLocalToggle("buzz-privacy-typing", true);
  const [profilePhoto, setProfilePhoto] = useLocalToggle("buzz-privacy-profile-photo", true);

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <SettingsSubHeader title={tr(lang, "Privacy Controls", "गोपनीयता सेटिंग्स")} onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bz-grid-paper">
        <TactileToggleRow
          label={tr(lang, "Show Last Seen Status", "लास्ट सीन दिखाएं")}
          desc={tr(lang, "Let your contacts see when you were last online", "संपर्कों को पता चलेगा कि आप कब ऑनलाइन थे")}
          checked={lastSeen}
          onChange={setLastSeen}
        />
        <TactileToggleRow
          label={tr(lang, "Read Receipts (Blue Ticks)", "रीड रिसीट्स (ब्लू टिक)")}
          desc={tr(lang, "Display checkmarks when messages are read", "संदेश पढ़े जाने पर चेकमार्क दिखेगा")}
          checked={readReceipts}
          onChange={setReadReceipts}
        />
        <TactileToggleRow
          label={tr(lang, "Typing Indicator", "टाइपिंग संकेत")}
          desc={tr(lang, "Broadcast typing state while writing a reply", "टाइप करते समय दूसरे को टाइपिंग दिखेगी")}
          checked={typing}
          onChange={setTyping}
        />
        <TactileToggleRow
          label={tr(lang, "Profile Photo Visibility", "प्रोफ़ाइल फ़ोटो दृश्यता")}
          desc={tr(lang, "Allow anyone with your @handle to view your avatar", "कोई भी आपकी प्रोफ़ाइल फ़ोटो देख सकेगा")}
          checked={profilePhoto}
          onChange={setProfilePhoto}
        />
      </div>
    </div>
  );
};

/* ─── Security View ─── */
const SecurityView = ({ onBack }: { onBack: () => void }) => {
  const lang = useAppLanguage();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [appLock, setAppLock] = useLocalToggle("buzz-app-lock", false);
  const [twoStep, setTwoStep] = useLocalToggle("buzz-two-step", false);

  const changePassword = async () => {
    if (pwd.length < 6) {
      toast.error(tr(lang, "Password must be at least 6 characters", "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए"));
      return;
    }
    if (pwd !== confirm) {
      toast.error(tr(lang, "Passwords don't match", "पासवर्ड मेल नहीं खाते"));
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) toast.error(error.message);
    else {
      toast.success(tr(lang, "Password updated successfully! 🔒", "पासवर्ड सफलतापूर्वक अपडेट हो गया! 🔒"));
      setPwd("");
      setConfirm("");
    }
    setSaving(false);
  };

  const handleSetPin = async () => {
    if (pin.length !== 4) {
      toast.error(tr(lang, "PIN must be exactly 4 digits", "पिन पूरे 4 अंकों का होना चाहिए"));
      return;
    }
    await setupAppPin(pin);
    setAppLock(true);
    setPin("");
  };

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <SettingsSubHeader title={tr(lang, "Security & PIN Lock", "सुरक्षा और पिन लॉक")} onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bz-grid-paper">
        <TactileToggleRow
          label={tr(lang, "App Lock Enabled", "ऐप लॉक सक्रिय")}
          desc={tr(lang, "Require 4-digit PIN every time Buzz opens", "Buzz खोलते समय 4-अंकों का पिन अनिवार्य होगा")}
          checked={appLock}
          onChange={setAppLock}
        />

        {appLock && (
          <div className="bz-card p-3 bg-[#FFF6B8] border-2 border-[#0a0a0a]">
            <p className="text-xs font-black text-[#0a0a0a] mb-1">{tr(lang, "Set 4-Digit Security PIN", "4-अंकों का नया पिन बनाएं")}</p>
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={4}
                placeholder="4 Digits"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="flex-1 rounded-xl border-2 border-[#0a0a0a] bg-white px-3 py-1.5 text-xs font-black tracking-widest outline-none text-center"
              />
              <button onClick={handleSetPin} className="bz-btn bz-btn-yellow px-3 py-1 text-xs font-black">
                {tr(lang, "Save PIN", "पिन सेव करें")}
              </button>
            </div>
          </div>
        )}

        <TactileToggleRow
          label={tr(lang, "Two-Step Verification", "टू-स्टेप वेरिफिकेशन")}
          desc={tr(lang, "Extra layer of protection on new logins", "नए लॉगिन पर अतिरिक्त सुरक्षा परत")}
          checked={twoStep}
          onChange={setTwoStep}
        />

        <div className="bz-card p-4 space-y-2.5 shadow-[0_4px_0_0_#0a0a0a]">
          <p className="text-xs font-black text-[#0a0a0a]">{tr(lang, "Change Password", "पासवर्ड बदलें")}</p>
          <input
            type="password"
            placeholder={tr(lang, "New password (min 6 chars)", "नया पासवर्ड (कम से कम 6 अक्षर)")}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full rounded-xl border-2 border-[#0a0a0a] bg-white px-3 py-2 text-xs font-bold outline-none"
          />
          <input
            type="password"
            placeholder={tr(lang, "Confirm new password", "पासवर्ड की पुष्टि करें")}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border-2 border-[#0a0a0a] bg-white px-3 py-2 text-xs font-bold outline-none"
          />
          <button
            onClick={changePassword}
            disabled={saving || !pwd}
            className="bz-btn bz-btn-yellow w-full py-2.5 text-xs font-black uppercase disabled:opacity-40"
          >
            {saving ? tr(lang, "Updating...", "अपडेट हो रहा है...") : tr(lang, "Update Password", "पासवर्ड अपडेट करें")}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Linked Devices (Buzz Connect) View (REAL CAMERA + ROCK-SOLID REALTIME) ─── */
const LinkedDevicesView = ({ onBack, username }: { onBack: () => void; username?: string }) => {
  const lang = useAppLanguage();
    const [devices, setDevices] = useState<BuzzDevice[]>([]);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [justLinkedDevice, setJustLinkedDevice] = useState<BuzzDevice | null>(null);
  const [inputPin, setInputPin] = useState("");
  const [authorizing, setAuthorizing] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<any>(null);

  const refreshDevices = () => {
    setDevices(getLinkedDevices(username));
  };

  useEffect(() => {
    refreshDevices();
    const handler = () => refreshDevices();
    window.addEventListener("buzz:devices-changed", handler);
    return () => window.removeEventListener("buzz:devices-changed", handler);
  }, [username]);

  // Clean camera stream on close
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Helper: load universal QR decoder fallback if native detector unavailable
  const ensureJsQR = async (): Promise<any> => {
    if ((window as any).jsQR) return (window as any).jsQR;
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
      s.onload = () => resolve((window as any).jsQR);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  };

  // Start Real Hardware Camera & Scanner Loop
  useEffect(() => {
    if (!showScannerModal) {
      stopCamera();
      return;
    }

    let isMounted = true;

    const startCamera = async () => {
      setCameraError("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }

        // Start frame capture loop
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const hasNativeDetector = "BarcodeDetector" in window;
        let barcodeDetector: any = null;
        if (hasNativeDetector) {
          try {
            barcodeDetector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
          } catch {
            barcodeDetector = null;
          }
        }
        const jsQRFallback = barcodeDetector ? null : await ensureJsQR();

        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2 || authorizing) return;

          const video = videoRef.current;
          let scannedRawText = "";

          // Fast native GPU scanner (Chrome Android / iOS 17+)
          if (barcodeDetector) {
            try {
              const barcodes = await barcodeDetector.detect(video);
              if (barcodes && barcodes.length > 0) {
                scannedRawText = barcodes[0].rawValue;
              }
            } catch {
              // fallback
            }
          }

          // Fallback canvas frame scanner
          if (!scannedRawText && jsQRFallback && ctx) {
            canvas.width = video.videoWidth || 320;
            canvas.height = video.videoHeight || 240;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQRFallback(imgData.data, imgData.width, imgData.height);
            if (code && code.data) {
              scannedRawText = code.data;
            }
          }

          if (scannedRawText) {
            try {
              navigator.vibrate?.(100);
            } catch {}
            stopCamera();
            await performAuthorization(scannedRawText);
          }
        }, 180);
      } catch (err: any) {
        setCameraError("Camera permission blocked or camera not found. Use PIN below.");
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [showScannerModal]);

  // Guaranteed Realtime Authorization (Both QR and PIN)
  const performAuthorization = async (rawCodeOrPin: string) => {
    let cleanPin = rawCodeOrPin.trim();

    // Check if JSON QR payload
    try {
      const parsed = JSON.parse(cleanPin);
      if (parsed.sessionId) cleanPin = parsed.sessionId;
    } catch {}

    // Check if URL payload
    if (cleanPin.includes("?s=")) {
      try {
        const u = new URL(cleanPin);
        cleanPin = u.searchParams.get("s") || cleanPin;
      } catch {}
    }

    // Normalize: remove "bz_" prefix and lowercase
    cleanPin = cleanPin.toLowerCase().replace(/^bz_/, "").trim();

    if (!cleanPin) {
      toast.error(tr(lang, "Invalid QR Code or PIN", "अमान्य QR कोड या PIN"));
      return;
    }

    setAuthorizing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login first to link devices.");
        setAuthorizing(false);
        return;
      }

      const channelName = `buzz-web-pair:${cleanPin}`;
      const channel = supabase.channel(channelName);

      // CRITICAL: Wait until WebSocket status is SUBSCRIBED before sending payload
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Pairing timeout. Ensure computer shows QR/PIN.")), 8000);
        channel.subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            resolve();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            clearTimeout(timeout);
            reject(err || new Error(`Channel status: ${status}`));
          }
        });
      });

      // Send 3 bursts (150ms apart) to guarantee delivery across the websocket
      for (let i = 0; i < 3; i++) {
        await channel.send({
          type: "broadcast",
          event: "auth-grant",
          payload: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
                       username: username || session.user.user_metadata?.username || "user",
          },
        });
        await new Promise((r) => setTimeout(r, 150));
      }

            // Record this newly linked computer with exact pairing timestamp
      const nowIso = new Date().toISOString();
      const newDev: BuzzDevice = {
        id: "dev_web_" + cleanPin,
        name: `Buzz Web (${cleanPin.toUpperCase()})`,
        type: "desktop",
        browser: "Desktop Web",
        os: "Web",
        isCurrent: false,
        pairedAt: nowIso,
        lastActive: nowIso,
        status: "active",
      };
      const existing = getLinkedDevices(username);
      saveDevices([newDev, ...existing.filter((d) => d.id !== newDev.id)], username);

      // Close scanner and trigger visual confirmation popup
      setShowScannerModal(false);
      setInputPin("");
      setJustLinkedDevice(newDev);
      refreshDevices();
      toast.success(tr(lang, "Computer Authorized! 🚀", "कंप्यूटर सफलतापूर्वक लिंक हो गया! 🚀"));
    } catch (e: any) {
      toast.error(e.message || "Failed to link device");
    } finally {
      setAuthorizing(false);
      stopCamera();
    }
  };

  const [selectedDevice, setSelectedDevice] = useState<BuzzDevice | null>(null);

  const formatDeviceDate = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Recently";
    }
  };

    const handleRevokeSingle = async (devId: string, name: string) => {
    if (confirm(tr(lang, `Disconnect ${name}?`, `क्या आप ${name} को डिस्कनेक्ट करना चाहते हैं?`))) {
      await revokeDevice(devId, username);
      toast.success(tr(lang, "Device disconnected remotely", "डिवाइस सफलतापूर्वक डिस्कनेक्ट हो गया"));
      setSelectedDevice(null);
      refreshDevices();
    }
  };

  const handleRevokeAllOthers = async () => {
    if (confirm(tr(lang, "Disconnect all other linked devices?", "क्या आप बाकी सभी लिंक्ड डिवाइसेस को डिस्कनेक्ट करना चाहते हैं?"))) {
      await revokeAllOtherDevices(username);
      toast.success(tr(lang, "All other sessions logged out!", "बाकी सभी सेशन्स लॉग आउट हो गए!"));
      setSelectedDevice(null);
      refreshDevices();
    }
  };

  const otherDevicesCount = devices.filter((d) => !d.isCurrent).length;

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <div className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-5 py-3.5 shadow-sm text-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-black text-[#0a0a0a]">{tr(lang, "Buzz Connect (Devices)", "Buzz Connect (डिवाइसेस)")}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bz-grid-paper">
        {/* Zero Phone Number Card */}
        <div className="bz-card p-4 bg-white space-y-2 border-2 border-[#0a0a0a] shadow-[0_4px_0_0_#0a0a0a]">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#FAF089] border border-[#0a0a0a] text-xs">🔒</span>
            <p className="text-xs font-black text-[#0a0a0a]">
              {tr(lang, "Link Computer or Tablet", "कंप्यूटर या टैबलेट लिंक करें")}
            </p>
          </div>
          <p className="text-[11px] font-semibold text-[#5b5b55] leading-relaxed">
            {tr(
              lang,
              "Pair your laptop or secondary browser instantly using Real Camera QR Scanner or Pairing PIN. No phone numbers ever required.",
              "अपने लैपटॉप या दूसरे ब्राउज़र को असली कैमरा QR स्कैनर या PIN से तुरंत लिंक करें। फोन नंबर की कोई ज़रूरत नहीं।"
            )}
          </p>
          <button
            onClick={() => setShowScannerModal(true)}
            className="bz-btn bz-btn-yellow w-full py-2.5 text-xs font-black uppercase flex items-center justify-center gap-2 mt-2"
          >
            <Camera className="h-4 w-4" /> {tr(lang, "Link a New Device", "नया डिवाइस लिंक करें")}
          </button>
        </div>

        {/* WhatsApp-Style REAL CAMERA SCANNER & Authorize Dialog */}
        <Dialog open={showScannerModal} onOpenChange={(open) => { setShowScannerModal(open); if (!open) stopCamera(); }}>
          <DialogContent className="max-w-sm border-2 border-[#0a0a0a] bg-[#FFFBEA] p-5">
            <DialogTitle className="text-base font-black text-[#0a0a0a] text-center flex items-center justify-center gap-2">
              <Camera className="h-5 w-5" />
              {tr(lang, "Scan Computer QR Code", "कंप्यूटर QR कोड स्कैन करें")}
            </DialogTitle>

            <div className="mt-2 flex flex-col items-center space-y-4">
              {/* Live Hardware Camera Viewfinder */}
              <div className="relative h-52 w-full rounded-2xl border-2 border-[#0a0a0a] bg-black overflow-hidden flex flex-col items-center justify-center shadow-[0_4px_0_0_#0a0a0a]">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? "opacity-100" : "opacity-0"}`}
                />

                {/* Laser scan targeting box */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative h-36 w-36 border-2 border-emerald-400 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"></div>
                  </div>
                </div>

                {!cameraActive && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-2">
                    <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <p className="text-[11px] font-bold">Starting camera...</p>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-4 text-center">
                    <p className="text-xs font-bold text-red-400 mb-2">{cameraError}</p>
                    <p className="text-[10px] text-white/80">You can still enter the Pairing PIN below</p>
                  </div>
                )}
              </div>

              {/* Authorizing Indicator */}
              {authorizing && (
                <div className="w-full rounded-xl border-2 border-[#0a0a0a] bg-[#FFF6B8] p-3 text-center space-y-1 animate-pulse">
                  <p className="text-xs font-black text-[#0a0a0a]">Authorizing Computer Screen...</p>
                  <p className="text-[10px] font-bold text-[#5b5b55]">Sending encrypted login handshake 🚀</p>
                </div>
              )}

              {/* Enter Computer PIN Option */}
              <div className="w-full space-y-2">
                <p className="text-[11px] font-bold text-[#5b5b55] text-center">
                  {tr(lang, "Or enter the Pairing PIN shown on screen:", "या कंप्यूटर पर दिख रहा Pairing PIN डालें:")}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 7K9P2X"
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    className="flex-1 rounded-xl border-2 border-[#0a0a0a] bg-white px-3 py-2 text-xs font-mono font-black uppercase outline-none text-center tracking-widest"
                  />
                  <button
                    onClick={() => performAuthorization(inputPin)}
                    disabled={authorizing || !inputPin.trim()}
                    className="bz-btn bz-btn-yellow px-4 py-2 text-xs font-black uppercase disabled:opacity-50"
                  >
                    {authorizing ? "..." : tr(lang, "Authorize", "लॉगिन करें")}
                  </button>
                </div>
              </div>

              <button
                onClick={() => { setShowScannerModal(false); stopCamera(); }}
                className="bz-btn bz-btn-white w-full py-2 text-xs font-bold"
              >
                {tr(lang, "Cancel", "रद्द करें")}
              </button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Device Linked Success Confirmation Modal */}
        <Dialog open={!!justLinkedDevice} onOpenChange={(open) => !open && setJustLinkedDevice(null)}>
          <DialogContent className="max-w-sm border-2 border-[#0a0a0a] bg-[#FFFBEA] p-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#0a0a0a] bg-[#86EFAC] shadow-[0_3px_0_0_#0a0a0a]">
              <Check className="h-8 w-8 text-[#0a0a0a]" />
            </div>
            <DialogTitle className="text-base font-black text-[#0a0a0a] mt-3">
              {tr(lang, "Device Linked Successfully! 🎉", "डिवाइस सफलतापूर्वक लिंक हो गया! 🎉")}
            </DialogTitle>
            <div className="rounded-xl border-2 border-[#0a0a0a] bg-white p-3 text-left space-y-1.5 my-2 shadow-[0_2px_0_0_#0a0a0a]">
              <div className="flex items-center gap-2 font-black text-xs text-[#0a0a0a]">
                <Laptop className="h-4 w-4" />
                <span>{justLinkedDevice?.name}</span>
              </div>
              <p className="text-[11px] text-[#5b5b55] font-semibold leading-relaxed">
                {tr(
                  lang,
                  "Your Buzz account is now connected and running on this computer. You can manage or log it out anytime below.",
                  "आपका Buzz खाता अब इस कंप्यूटर पर एक्टिव हो गया है। आप नीचे से कभी भी इसे लॉग आउट कर सकते हैं।"
                )}
              </p>
            </div>
            <button
              onClick={() => setJustLinkedDevice(null)}
              className="bz-btn bz-btn-yellow w-full py-2.5 text-xs font-black uppercase shadow-[0_3px_0_0_#0a0a0a] mt-1"
            >
              {tr(lang, "Done / View Sessions", "हो गया / सेशन्स देखें")}
            </button>
          </DialogContent>
        </Dialog>

        {/* Detailed Device Info Dialog */}
        <Dialog open={!!selectedDevice} onOpenChange={(open) => !open && setSelectedDevice(null)}>
          {selectedDevice && (
            <DialogContent className="max-w-sm border-2 border-[#0a0a0a] bg-[#FFFBEA] p-5">
              <DialogTitle className="text-base font-black text-[#0a0a0a] flex items-center gap-2">
                {selectedDevice.type === "mobile" ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
                {selectedDevice.name}
              </DialogTitle>

              <div className="mt-3 space-y-3">
                <div className="rounded-xl border-2 border-[#0a0a0a] bg-white p-3 space-y-2 text-xs">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-bold text-[#5b5b55]">Status:</span>
                    <span className="font-black text-emerald-600">
                      {selectedDevice.isCurrent ? "Active (This Device) 🟢" : "Linked Session 🟢"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-bold text-[#5b5b55]">Linked on:</span>
                    <span className="font-black font-mono text-[#0a0a0a]">{formatDeviceDate(selectedDevice.pairedAt)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-bold text-[#5b5b55]">Last Active:</span>
                    <span className="font-black font-mono text-[#0a0a0a]">
                      {selectedDevice.isCurrent ? "Right now" : formatDeviceDate(selectedDevice.lastActive)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-bold text-[#5b5b55]">Platform:</span>
                    <span className="font-black text-[#0a0a0a]">{selectedDevice.os || "Web"} · {selectedDevice.browser || "Browser"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-[#5b5b55]">Session ID:</span>
                    <span className="font-mono text-[10px] font-bold text-[#0a0a0a]">{selectedDevice.id.replace("dev_", "").toUpperCase()}</span>
                  </div>
                </div>

                                <button
                  onClick={() => {
                    if (selectedDevice.isCurrent) {
                      if (confirm(tr(lang, "Log out from Buzz on this device?", "क्या आप इस डिवाइस से लॉग आउट करना चाहते हैं?"))) {
                        supabase.auth.signOut();
                        window.location.reload();
                      }
                    } else {
                      handleRevokeSingle(selectedDevice.id, selectedDevice.name);
                    }
                  }}
                  className="bz-btn bz-btn-ink w-full py-2.5 text-xs font-black uppercase text-red-300 hover:text-red-100 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> {selectedDevice.isCurrent ? tr(lang, "Log Out This Device", "इस डिवाइस को लॉग आउट करें") : tr(lang, "Disconnect Remotely", "रिमोटली डिस्कनेक्ट करें")}
                </button>

                <button
                  onClick={() => setSelectedDevice(null)}
                  className="bz-btn bz-btn-white w-full py-2 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* Active Devices List with Full Login Information & Action Buttons */}
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-[#5b5b55]">
            {tr(lang, "Active Linked Sessions", "सक्रिय लिंक्ड सेशन्स")}
          </p>

          {devices.map((dev) => (
            <div
              key={dev.id}
              onClick={() => setSelectedDevice(dev)}
              className="bz-card p-3.5 bg-white border-2 border-[#0a0a0a] shadow-[0_3px_0_0_#0a0a0a] hover:bg-[#FFFDF5] cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#E2E8F0] shadow-[0_2px_0_0_#0a0a0a]">
                    {dev.type === "mobile" ? <Smartphone className="h-5 w-5 text-[#0a0a0a]" /> : <Laptop className="h-5 w-5 text-[#0a0a0a]" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-[#0a0a0a] truncate">{dev.name}</p>
                      {dev.isCurrent ? (
                        <span className="rounded-full bg-emerald-100 border border-emerald-500 px-1.5 py-0.2 text-[9px] font-black text-emerald-800 flex-shrink-0">
                          {tr(lang, "This Device", "यह डिवाइस")}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 border border-amber-500 px-1.5 py-0.2 text-[9px] font-black text-amber-800 flex-shrink-0">
                          Linked
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-semibold text-[#5b5b55] flex items-center gap-1.5 mt-0.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {dev.isCurrent ? "Active now" : `Last active ${formatDeviceDate(dev.lastActive)}`}
                    </p>
                  </div>
                </div>

                {/* Hamesha Disconnect / Logout button show hoga */}
                                               <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (dev.isCurrent) {
                      if (confirm(tr(lang, "Log out from this device?", "क्या आप इस डिवाइस से लॉग आउट करना चाहते हैं?"))) {
                        await performFullLogout();
                      }
                    } else {
                      handleRevokeSingle(dev.id, dev.name);
                    }
                  }}
                  className={`flex-shrink-0 rounded-lg border-2 px-2.5 py-1 text-[11px] font-black shadow-[0_2px_0_0_#0a0a0a] flex items-center gap-1 ${
                    dev.isCurrent
                      ? "border-[#0a0a0a] bg-zinc-50 text-[#0a0a0a] hover:bg-zinc-100"
                      : "border-red-500 bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                  title={dev.isCurrent ? "Log Out" : "Remote Disconnect"}
                >
                  <LogOut className="h-3 w-3" />
                  {dev.isCurrent ? tr(lang, "Log Out", "लॉग आउट") : tr(lang, "Disconnect", "हटाएं")}
                </button>
                
                    dev.isCurrent
                      ? "border-[#0a0a0a] bg-zinc-50 text-[#0a0a0a] hover:bg-zinc-100"
                      : "border-red-500 bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                  title={dev.isCurrent ? "Log Out" : "Remote Disconnect"}
                >
                  <LogOut className="h-3 w-3" />
                  {dev.isCurrent ? tr(lang, "Log Out", "लॉग आउट") : tr(lang, "Disconnect", "हटाएं")}
                </button>
              </div>

              {/* Login Timing Details Banner */}
              <div className="rounded-lg border border-[#0a0a0a]/15 bg-[#FFFBEA] px-2.5 py-1.5 text-[10px] font-bold text-[#5b5b55] flex items-center justify-between">
                <span>📅 Linked: <strong className="text-[#0a0a0a]">{formatDeviceDate(dev.pairedAt)}</strong></span>
                <span className="font-mono text-[9px] uppercase text-[#71717a]">ID: {dev.id.replace("dev_", "").substring(0, 8)}</span>
              </div>
            </div>
          ))}

          {otherDevicesCount === 0 && (
            <div className="rounded-xl border border-dashed border-[#0a0a0a]/25 bg-[#FFFBEA] p-3 text-center space-y-1 mt-2">
              <p className="text-xs font-bold text-[#0a0a0a]">No other devices linked yet</p>
              <p className="text-[10px] text-[#5b5b55]">Tap "Link a New Device" above to connect your laptop with QR or PIN.</p>
            </div>
          )}
        </div>

        {/* Emergency Remote Logout All Button */}
        {otherDevicesCount > 0 && (
          <button
            onClick={handleRevokeAllOthers}
            className="bz-btn bz-btn-ink w-full py-2.5 text-xs font-black uppercase text-red-300 hover:text-red-100 flex items-center justify-center gap-2 mt-4"
          >
            <ShieldAlert className="h-4 w-4" />
            {tr(lang, "Disconnect All Other Devices", "बाकी सभी डिवाइसेस को डिस्कनेक्ट करें")}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Notifications View ─── */
const NotificationsView = ({ onBack }: { onBack: () => void }) => {
  const lang = useAppLanguage();
  const [messages, setMessages] = useLocalToggle("buzz-notif-messages", true);
  const [groups, setGroups] = useLocalToggle("buzz-notif-groups", true);
  const [calls, setCalls] = useLocalToggle("buzz-notif-calls", true);
  const [sound, setSound] = useLocalToggle("buzz-notif-sound", true);
  const [vibrate, setVibrate] = useLocalToggle("buzz-notif-vibrate", true);
  const [preview, setPreview] = useLocalToggle("buzz-notif-preview", true);

  const requestBrowser = async () => {
    if (!pushSupported()) {
      toast.error("Not supported on this browser — Add Buzz to Home Screen first.");
      return;
    }
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const ok = await enablePush(data.user.id);
    if (ok) toast.success(tr(lang, "Browser push notifications activated! 🔔", "वेब पुश नोटिफिकेशन चालू हो गया! 🔔"));
    else toast.error(tr(lang, "Notification permission was denied.", "नोटिफिकेशन की अनुमति नहीं दी गई।"));
  };

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <SettingsSubHeader title={tr(lang, "Notifications", "नोटिफ़िकेशन")} onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bz-grid-paper">
        <button
          onClick={requestBrowser}
          className="bz-btn bz-btn-yellow w-full py-2.5 text-xs font-black uppercase shadow-[0_3px_0_0_#0a0a0a]"
        >
          {tr(lang, "Enable Web Push (Background Rings)", "बैकग्राउंड कॉल व पुश चालू करें")}
        </button>

        <TactileToggleRow label={tr(lang, "Message Notifications", "संदेश नोटिफ़िकेशन")} checked={messages} onChange={setMessages} />
        <TactileToggleRow label={tr(lang, "Group Notifications", "ग्रुप नोटिफ़िकेशन")} checked={groups} onChange={setGroups} />
        <TactileToggleRow label={tr(lang, "Call Alerts", "कॉल अलर्ट्स")} checked={calls} onChange={setCalls} />
        <TactileToggleRow label={tr(lang, "Sound Effects", "ध्वनि प्रभाव (Sound)")} checked={sound} onChange={setSound} />
        <TactileToggleRow label={tr(lang, "Vibrate", "कंपन (Vibrate)")} checked={vibrate} onChange={setVibrate} />
        <TactileToggleRow label={tr(lang, "Show Message Preview", "संदेश का पूर्वावलोकन")} checked={preview} onChange={setPreview} />
      </div>
    </div>
  );
};

/* ─── Language View ─── */
const LanguageView = ({ onBack }: { onBack: () => void }) => {
  const [lang, setLang] = useLocalString("buzz-language", "en");

  const setAppLanguage = (code: string) => {
    setLang(code);
    localStorage.setItem("buzz-language", code);
    toast.success(code === "hi" ? "भाषा बदलकर हिन्दी कर दी गई है! 🇮🇳" : "Language set to English! 🌐");
    window.dispatchEvent(new Event("languagechange"));
  };

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <SettingsSubHeader title="App Language / भाषा" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bz-grid-paper">
        {[
          { code: "en", label: "English", sub: "Standard English interface" },
          { code: "hi", label: "हिन्दी (Hindi)", sub: "सम्पूर्ण हिन्दी इंटरफ़ेस 🇮🇳" },
        ].map((l) => (
          <div
            key={l.code}
            onClick={() => setAppLanguage(l.code)}
            className={`bz-card p-3.5 flex items-center justify-between cursor-pointer transition-all ${
              lang === l.code ? "bg-[#FFF6B8] border-2 border-[#0a0a0a] shadow-[0_3px_0_0_#0a0a0a]" : "hover:bg-white"
            }`}
          >
            <div>
              <span className="text-xs font-black text-[#0a0a0a]">{l.label}</span>
              <p className="text-[10px] text-[#5b5b55] font-semibold">{l.sub}</p>
            </div>
            {lang === l.code && <Check className="h-5 w-5 stroke-[3] text-black" />}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Help View ─── */
const HelpView = ({ onBack }: { onBack: () => void }) => {
  const lang = useAppLanguage();
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    {
      q: tr(lang, "How do I find friends without phone numbers?", "फ़ोन नंबर के बिना दोस्तों को कैसे खोजें?"),
      a: tr(lang, "Tap the Discover tab and search by their unique @username, or scan their personal QR code.", "Discover टैब में जाएं और उनके @username से खोजें या उनका QR कोड स्कैन करें।"),
    },
    {
      q: tr(lang, "What is Ghost Voice in Guest Chat?", "गेस्ट चैट में घोस्ट वॉइस (Ghost Voice) क्या है?"),
      a: tr(lang, "Ghost Voice applies browser audio filters (Robot, Demon, Chipmunk, Deep) for private voice messages.", "यह आपकी आवाज़ बदलकर रोबोट, डेमन या चिंपमंक जैसी बनाकर गुप्त वॉइस मैसेज भेजता है।"),
    },
    {
      q: tr(lang, "Are my chats secure?", "क्या मेरी चैट पूरी तरह सुरक्षित हैं?"),
      a: tr(lang, "Yes. Buzz isolates chats using Supabase Row-Level Security and peer-to-peer WebRTC channels for audio/video calls.", "हाँ, Buzz की सभी चैट और कॉल सीधे एन्क्रिप्टेड और सुरक्षित हैं।"),
    },
    {
      q: tr(lang, "How do 24-Hour Moments work?", "24 घंटे वाले मोमेंट्स कैसे काम करते हैं?"),
      a: tr(lang, "Moments automatically disappear after 24 hours. You can view real-time counts of who watched your moment.", "मोमेंट्स 24 घंटे के बाद अपने आप हट जाते हैं और आप देख सकते हैं कि किसने देखा।"),
    },
  ];

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <SettingsSubHeader title={tr(lang, "Help & FAQs", "सहायता व अक्सर पूछे जाने वाले सवाल")} onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bz-grid-paper">
        {faqs.map((f, i) => (
          <div key={i} className="bz-card p-3 overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-xs font-black text-[#0a0a0a]">{f.q}</span>
              <span className="font-bold text-sm">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <p className="mt-2 text-[11px] text-[#5b5b55] leading-relaxed">{f.a}</p>}
          </div>
        ))}

        <div className="bz-card p-4 bg-[#E2ECFF] mt-4">
          <p className="text-xs font-black text-[#0a0a0a]">{tr(lang, "Need Direct Assistance?", "सीधी सहायता चाहिए?")}</p>
          <p className="text-[11px] text-[#5b5b55] mt-1 mb-3">{tr(lang, "Our team replies within 24 hours.", "हमारी टीम 24 घंटे में उत्तर देती है।")}</p>
          <a
            href="mailto:prasadprem904@gmail.com"
            className="bz-btn bz-btn-white inline-flex px-3 py-1.5 text-xs font-bold"
          >
            {tr(lang, "Email Support", "सपोर्ट ईमेल करें")}
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─── Profile Panel ─── */
const ProfilePanel = ({ onBack, username }: { onBack?: () => void; username?: string }) => {
  const lang = useAppLanguage();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [about, setAbout] = useState("Hey there! I'm using Buzz 💬");
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showQR, setShowQR] = useState(false);
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
      toast.success(tr(lang, "Avatar updated! 🎉", "प्रोफ़ाइल फ़ोटो अपडेट हो गई! 🎉"));
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
      toast.success(tr(lang, "About updated!", "बायो अपडेट हो गया!"));
    }
    setEditingAbout(false);
  };

  const handleSaveName = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user.id);
      toast.success(tr(lang, "Name updated!", "नाम अपडेट हो गया!"));
    }
    setEditingName(false);
  };

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("avatar_url, about, display_name").eq("user_id", user.id).maybeSingle();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        if (data?.about) setAbout(data.about);
        if (data?.display_name) setDisplayName(data.display_name);
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
          <h1 className="text-lg font-black text-[#0a0a0a]">{tr(lang, "My Profile 👤", "मेरी प्रोफ़ाइल 👤")}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bz-grid-paper">
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
              title="Change Profile Photo"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>

          <h2 className="mt-4 text-lg font-black text-[#0a0a0a]">@{username || "user"}</h2>
          <span className="mt-1 inline-block rounded-full border border-[#0a0a0a] bg-[#DCF4E4] px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
            {tr(lang, "Verified Buzz Handle 🇮🇳", "वेरीफाइड बज़ यूज़र 🇮🇳")}
          </span>
        </div>

        {/* Display Name Card */}
        <div className="bz-card p-4 shadow-[0_3px_0_0_#0a0a0a]">
          <div className="flex items-center justify-between mb-2">
            <span className="bz-label">{tr(lang, "Display Name", "प्रदर्शित नाम")}</span>
            <button
              onClick={() => (editingName ? handleSaveName() : setEditingName(true))}
              className="text-xs font-extrabold text-[#0a0a0a] underline"
            >
              {editingName ? tr(lang, "Save", "सेव") : tr(lang, "Edit", "बदलें")}
            </button>
          </div>
          {editingName ? (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              placeholder="Your full name"
              className="w-full rounded-lg border-2 border-[#0a0a0a] bg-[#fffbec] p-2 text-xs font-bold outline-none"
              autoFocus
            />
          ) : (
            <p className="text-xs font-semibold text-[#0a0a0a]">{displayName || tr(lang, "Not set", "सेट नहीं है")}</p>
          )}
        </div>

        {/* About / Bio Card */}
        <div className="bz-card p-4 shadow-[0_3px_0_0_#0a0a0a]">
          <div className="flex items-center justify-between mb-2">
            <span className="bz-label">{tr(lang, "About / Bio", "परिचय (Bio)")}</span>
            <button
              onClick={() => (editingAbout ? handleSaveAbout() : setEditingAbout(true))}
              className="text-xs font-extrabold text-[#0a0a0a] underline"
            >
              {editingAbout ? tr(lang, "Save", "सेव") : tr(lang, "Edit", "बदलें")}
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

        {/* Personal QR Code Toggle */}
        <div className="bz-card p-4 shadow-[0_3px_0_0_#0a0a0a]">
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex w-full items-center justify-between text-xs font-black text-[#0a0a0a]"
          >
            <span className="flex items-center gap-2">
              <QrCode className="h-4 w-4" /> {tr(lang, "My Personal Invite QR", "मेरा पर्सनल इनवाइट QR")}
            </span>
            <span className="text-sm font-bold">{showQR ? "−" : "+"}</span>
          </button>
          {showQR && username && (
            <div className="mt-3 flex flex-col items-center pt-3 border-t-2 border-[#0a0a0a]/15">
              <div className="rounded-2xl border-2 border-[#0a0a0a] bg-white p-3 shadow-[0_3px_0_0_#0a0a0a]">
                <QRCodeSVG value={`https://chat-without-digits.lovable.app/c/${username}`} size={130} level="H" />
              </div>
              <p className="mt-2 text-[10px] font-mono font-bold text-[#5b5b55]">Scan to chat with @{username}</p>
            </div>
          )}
        </div>

        {/* Direct Logout */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            toast.success("Logged out");
          }}
          className="bz-btn bz-btn-ink w-full py-2.5 text-xs font-black uppercase text-red-300 hover:text-red-100"
        >
          <LogOut className="h-4 w-4" /> {tr(lang, "Log Out of Buzz", "लॉग आउट करें")}
        </button>
      </div>
    </div>
  );
};

export default SectionPanel;
