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
  X,
  Phone,
  Video,
  Send,
  Eye,
  Palette,
  QrCode,
  Check,
  CheckCheck,
  LockKeyhole,
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
import { QRCodeSVG } from "qrcode.react";

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
  groups: Group[];
  onCreateGroup: (name: string, description: string, memberIds: string[]) => void;
  onSelectGroup: (groupId: string) => void;
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

/* ─── Helpers for Setting Toggles ─── */
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

const TactileToggleRow = ({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="bz-card p-3 flex items-center justify-between cursor-pointer hover:bg-white" onClick={() => onChange(!checked)}>
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
        className={`absolute top-0.5 h-4 w-4 rounded-full border-2 border-[#0a0a0a] bg-white transition-transform ${
          checked ? "translate-x-[22px] bg-[#0a0a0a]" : "translate-x-0.5"
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

/* ─── Settings Subviews ─── */
const AccountView = ({ onBack }: { onBack: () => void }) => {
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
      else toast.success("Account updated successfully! 🎉");
    }
    setSaving(false);
  };

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <SettingsSubHeader title="Account Info" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bz-grid-paper">
        {!profile ? (
          <p className="text-xs text-[#5b5b55] font-bold">Loading profile data...</p>
        ) : (
          <>
            <div className="bz-card p-3">
              <label className="text-[10px] font-mono font-bold text-[#5b5b55] uppercase">Permanent Username</label>
              <input
                value={`@${profile.username}`}
                disabled
                className="mt-1 w-full rounded-lg border-2 border-[#0a0a0a] bg-[#fffbec]/50 px-3 py-2 text-xs font-black text-[#0a0a0a]"
              />
              <p className="text-[10px] text-[#5b5b55] mt-1 font-medium">Username acts as your immutable ID</p>
            </div>

            <div className="bz-card p-3">
              <label className="text-[10px] font-mono font-bold text-[#5b5b55] uppercase">Display Name</label>
              <input
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                className="mt-1 w-full rounded-lg border-2 border-[#0a0a0a] bg-white px-3 py-2 text-xs font-bold text-[#0a0a0a] outline-none"
              />
            </div>

            <div className="bz-card p-3">
              <label className="text-[10px] font-mono font-bold text-[#5b5b55] uppercase">About / Bio</label>
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
              {saving ? "Saving..." : "Save Account Changes"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const PrivacyView = ({ onBack }: { onBack: () => void }) => {
  const [lastSeen, setLastSeen] = useLocalToggle("buzz-privacy-last-seen", true);
  const [readReceipts, setReadReceipts] = useLocalToggle("buzz-privacy-read-receipts", true);
  const [typing, setTyping] = useLocalToggle("buzz-privacy-typing", true);
  const [profilePhoto, setProfilePhoto] = useLocalToggle("buzz-privacy-profile-photo", true);

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <SettingsSubHeader title="Privacy Controls" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bz-grid-paper">
        <TactileToggleRow
          label="Show Last Seen Status"
          desc="Let your contacts see when you were last online"
          checked={lastSeen}
          onChange={setLastSeen}
        />
        <TactileToggleRow
          label="Read Receipts (Blue Ticks)"
          desc="Display checkmarks when messages are read"
          checked={readReceipts}
          onChange={setReadReceipts}
        />
        <TactileToggleRow
          label="Typing Indicator"
          desc="Broadcast typing state while writing a reply"
          checked={typing}
          onChange={setTyping}
        />
        <TactileToggleRow
          label="Profile Photo Visibility"
          desc="Allow anyone with your @handle to view your avatar"
          checked={profilePhoto}
          onChange={setProfilePhoto}
        />
      </div>
    </div>
  );
};

const SecurityView = ({ onBack }: { onBack: () => void }) => {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [appLock, setAppLock] = useLocalToggle("buzz-app-lock", false);
  const [twoStep, setTwoStep] = useLocalToggle("buzz-two-step", false);

  const changePassword = async () => {
    if (pwd.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (pwd !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated successfully");
      setPwd("");
      setConfirm("");
    }
    setSaving(false);
  };

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <SettingsSubHeader title="Security & App Lock" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bz-grid-paper">
        <TactileToggleRow
          label="App Lock (Biometric / PIN)"
          desc="Require authentication every time Buzz opens"
          checked={appLock}
          onChange={setAppLock}
        />
        <TactileToggleRow
          label="Two-Step Verification"
          desc="Extra layer of protection on new logins"
          checked={twoStep}
          onChange={setTwoStep}
        />

        <div className="bz-card p-4 space-y-2.5 shadow-[0_4px_0_0_#0a0a0a]">
          <p className="text-xs font-black text-[#0a0a0a]">Change Password</p>
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full rounded-xl border-2 border-[#0a0a0a] bg-white px-3 py-2 text-xs font-bold outline-none"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border-2 border-[#0a0a0a] bg-white px-3 py-2 text-xs font-bold outline-none"
          />
          <button
            onClick={changePassword}
            disabled={saving || !pwd}
            className="bz-btn bz-btn-yellow w-full py-2.5 text-xs font-black uppercase disabled:opacity-40"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationsView = ({ onBack }: { onBack: () => void }) => {
  const [messages, setMessages] = useLocalToggle("buzz-notif-messages", true);
  const [groups, setGroups] = useLocalToggle("buzz-notif-groups", true);
  const [calls, setCalls] = useLocalToggle("buzz-notif-calls", true);
  const [sound, setSound] = useLocalToggle("buzz-notif-sound", true);
  const [vibrate, setVibrate] = useLocalToggle("buzz-notif-vibrate", true);
  const [preview, setPreview] = useLocalToggle("buzz-notif-preview", true);

  const requestBrowser = async () => {
    if (!pushSupported()) {
      toast.error("Not supported on this browser — Add Buzz to Home Screen on iOS first.");
      return;
    }
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const ok = await enablePush(data.user.id);
    if (ok) toast.success("Browser push notifications activated! 🔔");
    else toast.error("Notification permission was denied.");
  };

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <SettingsSubHeader title="Notifications" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bz-grid-paper">
        <button
          onClick={requestBrowser}
          className="bz-btn bz-btn-yellow w-full py-2.5 text-xs font-black uppercase shadow-[0_3px_0_0_#0a0a0a]"
        >
          Enable Browser Web Push (Background Rings)
        </button>

        <TactileToggleRow label="Message Notifications" checked={messages} onChange={setMessages} />
        <TactileToggleRow label="Group Notifications" checked={groups} onChange={setGroups} />
        <TactileToggleRow label="Call Alerts" checked={calls} onChange={setCalls} />
        <TactileToggleRow label="Sound Effects" checked={sound} onChange={setSound} />
        <TactileToggleRow label="Vibrate" checked={vibrate} onChange={setVibrate} />
        <TactileToggleRow label="Show Message Preview" checked={preview} onChange={setPreview} />
      </div>
    </div>
  );
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
];

const LanguageView = ({ onBack }: { onBack: () => void }) => {
  const [lang, setLang] = useLocalString("buzz-language", "en");

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <SettingsSubHeader title="App Language" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bz-grid-paper">
        {LANGUAGES.map((l) => (
          <div
            key={l.code}
            onClick={() => {
              setLang(l.code);
              toast.success(`Language set to ${l.label}`);
            }}
            className={`bz-card p-3 flex items-center justify-between cursor-pointer ${
              lang === l.code ? "bg-[#FFF6B8] border-2 border-[#0a0a0a]" : "hover:bg-white"
            }`}
          >
            <span className="text-xs font-black text-[#0a0a0a]">{l.label}</span>
            {lang === l.code && <Check className="h-4 w-4 stroke-[3]" />}
          </div>
        ))}
      </div>
    </div>
  );
};

const HelpView = ({ onBack }: { onBack: () => void }) => {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    {
      q: "How do I find friends without phone numbers?",
      a: "Tap the Discover tab and search by their unique @username, or scan their personal QR code.",
    },
    {
      q: "What is Ghost Voice in Guest Chat?",
      a: "Ghost Voice applies real-time browser audio filters (Robot, Demon, Chipmunk, Deep) so callers can chat anonymously.",
    },
    {
      q: "Are my chats truly encrypted?",
      a: "Yes. Buzz isolates chats using Supabase Row-Level Security and peer-to-peer WebRTC channels for audio/video calls.",
    },
    {
      q: "How do 24-Hour Moments work?",
      a: "Moments automatically disappear after 24 hours. You can view real-time counts of who watched your moment.",
    },
  ];

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      <SettingsSubHeader title="Help & FAQs" onBack={onBack} />
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
          <p className="text-xs font-black text-[#0a0a0a]">Need Direct Assistance?</p>
          <p className="text-[11px] text-[#5b5b55] mt-1 mb-3">Our team replies within 24 hours.</p>
          <a
            href="mailto:prasadprem904@gmail.com"
            className="bz-btn bz-btn-white inline-flex px-3 py-1.5 text-xs font-bold"
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN SETTINGS PANEL ─── */
type SettingsView = "main" | "account" | "privacy" | "security" | "notifications" | "language" | "help" | "chat-themes";

const SettingsPanel = ({ onBack }: { onBack?: () => void }) => {
  const { theme, setTheme } = useTheme();
  const [view, setView] = useState<SettingsView>("main");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out of Buzz");
  };

  if (view === "account") return <AccountView onBack={() => setView("main")} />;
  if (view === "privacy") return <PrivacyView onBack={() => setView("main")} />;
  if (view === "security") return <SecurityView onBack={() => setView("main")} />;
  if (view === "notifications") return <NotificationsView onBack={() => setView("main")} />;
  if (view === "language") return <LanguageView onBack={() => setView("main")} />;
  if (view === "help") return <HelpView onBack={() => setView("main")} />;
  if (view === "chat-themes") return <ChatThemesPanel onBack={() => setView("main")} />;

  const settingGroups: {
    title: string;
    items: { icon: typeof User; label: string; desc: string; view: SettingsView }[];
  }[] = [
    {
      title: "Account & Security",
      items: [
        { icon: User, label: "Account Info", desc: "Username, display name, about", view: "account" },
        { icon: Lock, label: "Privacy", desc: "Last seen, read receipts, typing", view: "privacy" },
        { icon: Shield, label: "Security", desc: "Password, app lock, 2-step", view: "security" },
      ],
    },
    {
      title: "Preferences & Customization",
      items: [
        { icon: Palette, label: "Chat Themes", desc: "Buzz default cream + wallpapers", view: "chat-themes" },
        { icon: Bell, label: "Notifications", desc: "Browser Web Push, tones, preview", view: "notifications" },
        { icon: Globe, label: "Language", desc: "Select app interface language", view: "language" },
        { icon: HelpCircle, label: "Help & FAQs", desc: "Guides, troubleshooting, contact", view: "help" },
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
          <h1 className="text-lg font-black text-[#0a0a0a]">Settings ⚙️</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bz-grid-paper">
        {/* Appearance Card */}
        <div
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="bz-card p-3.5 flex items-center justify-between cursor-pointer hover:bg-white"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] shadow-[0_2px_0_0_#0a0a0a]">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-xs font-black text-[#0a0a0a]">Theme Mode</p>
              <p className="text-[11px] text-[#5b5b55]">{theme === "dark" ? "Dark Active" : "Light Active"}</p>
            </div>
          </div>
          <span className="bz-btn bz-btn-white px-2.5 py-1 text-xs font-bold">Toggle</span>
        </div>

        {/* Guest Chat shortcut */}
        <a href="/guests" className="bz-card p-3.5 flex items-center justify-between hover:bg-white block">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#E2ECFF] shadow-[0_2px_0_0_#0a0a0a]">
              <Globe className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <p className="text-xs font-black text-[#0a0a0a]">Guest Inbox</p>
              <p className="text-[11px] text-[#5b5b55]">Secret confessions & anonymous chats</p>
            </div>
          </div>
          <span className="text-base font-black">›</span>
        </a>

        {/* Settings Sub-Groups */}
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

        {/* Zero Phone Number Guarantee */}
        <div className="rounded-2xl border-2 border-[#0a0a0a] bg-[#DCF4E4] p-3.5 shadow-[0_2px_0_0_#0a0a0a]">
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

        <div className="pt-4 text-center text-[10px] font-mono text-[#5b5b55] font-bold">
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
        const { data } = await supabase.from("profiles").select("avatar_url, about").eq("user_id", user.id).maybeSingle();
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

/* ─── Moments ─── */
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
  const [newText, setNewText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
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
      setMediaPreview(null);
      toast.success("Moment shared! Disappears in 24 hours ⏱️");
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
          <h1 className="text-lg font-black text-[#0a0a0a]">Moments (24h) ⏱️</h1>
        </div>
      </div>

      <div className="p-4 border-b-2 border-[#0a0a0a]/15 bg-white space-y-3">
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Share what's on your mind..."
          className="w-full rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] p-3 text-xs font-semibold outline-none resize-none"
          rows={2}
        />
        <div className="flex items-center justify-between">
          <button
            onClick={() => fileRef.current?.click()}
            className="bz-btn bz-btn-white px-3 py-1.5 text-xs font-bold"
          >
            <Camera className="h-3.5 w-3.5" /> Attach Media
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setMediaFile(f);
              setMediaPreview(URL.createObjectURL(f));
            }}
          />
          <button
            onClick={handlePost}
            disabled={posting || (!newText.trim() && !mediaFile)}
            className="bz-btn bz-btn-yellow px-4 py-1.5 text-xs font-black disabled:opacity-50"
          >
            {posting ? "Sharing..." : "Post Moment"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bz-grid-paper">
        {moments.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-[#5b5b55]">
            No moments active yet. Be the first to share one!
          </div>
        ) : (
          moments.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                setViewingMoment(m);
                onRecordView(m.id);
              }}
              className="bz-card p-3 cursor-pointer hover:bg-white transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#0a0a0a]">@{m.profile?.username || "user"}</span>
                <span className="text-[10px] font-mono text-[#5b5b55]">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#0a0a0a]">{m.text}</p>
            </div>
          ))
        )}
      </div>
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
  const [recentUsers, setRecentUsers] = useState<DbProfile[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("*").limit(10);
      if (data) setRecentUsers(data);
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
          <h1 className="text-lg font-black text-[#0a0a0a]">Connect & Calls 📞</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bz-grid-paper">
        {recentUsers.map((u) => (
          <div key={u.user_id} className="bz-card p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-[#0a0a0a]">{u.display_name || u.username}</p>
              <p className="text-[10px] font-mono text-[#5b5b55]">@{u.username}</p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => onStartCall?.(u.user_id, "voice")}
                className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_1px_0_0_#0a0a0a]"
              >
                <Phone className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onStartCall?.(u.user_id, "video")}
                className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_1px_0_0_#0a0a0a]"
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

export default SectionPanel;
