import { useEffect, useState } from "react";
import { 
  Sparkles, 
  Ghost, 
  Copy, 
  Check, 
  Link2, 
  MessageCircle, 
  Inbox, 
  QrCode, 
  Mic, 
  ShieldCheck, 
  Zap, 
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const GHOST_EFFECTS = [
  { id: "ghost", label: "👻 Ghost", desc: "High pitch disguise" },
  { id: "mafia", label: "🕶️ Mafia", desc: "Ultra deep rumble" },
  { id: "robot", label: "🤖 Robot", desc: "Metallic modulation" },
  { id: "whisper", label: "🤫 Whisper", desc: "Mysterious echo" },
];

export default function NewFeatureSpotlight({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("username")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => setUsername(data?.username ?? ""));

    // Launch popup after brief delay
    const t = setTimeout(() => setOpen(true), 800);

    // Re-open anytime via sidebar event
    const handleOpen = () => setOpen(true);
    window.addEventListener("buzz:open-spotlight", handleOpen);

    return () => {
      clearTimeout(t);
      window.removeEventListener("buzz:open-spotlight", handleOpen);
    };
  }, [userId]);

  const link = `${window.location.origin}/c/${username}`;
  const statusCaption = `🔥 Mujhse secret chat karo — bina app, bina login!\n🎙️ Ghost Voice mein aawaz badal ke bolo (Mafia, Robot, Whisper)\n👇 Link par tap karo:\n${link}`;

  const copyToClipboard = async (text: string, type: "link" | "status") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        toast.success("Guest link clipboard mein copy ho gaya! 🚀");
      } else {
        setCopiedStatus(true);
        setTimeout(() => setCopiedStatus(false), 2000);
        toast.success("Ready-made viral status copy ho gaya! 💬");
      }
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto rounded-3xl p-0 border border-border/80 shadow-2xl scrollbar-thin">
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden gradient-brand px-6 pb-6 pt-7 text-primary-foreground">
          {/* Subtle background glow effect */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin-slow" />
              New Viral Feature
            </span>
            {username && (
              <span className="rounded-full bg-black/20 px-2.5 py-0.5 font-mono text-xs font-medium text-white/90">
                @{username}
              </span>
            )}
          </div>

          <DialogTitle className="mt-3 text-2xl font-black tracking-tight text-white">
            Buzz Guest Chat Link
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-white/90 leading-relaxed">
            Samne wale ko koi app ya account nahi chahiye — link kholte hi direct anonymous chat aur voice notes!
          </DialogDescription>

          {/* Interactive Ghost Voice Preview Card */}
          <div className="mt-4 rounded-2xl bg-black/25 p-3.5 backdrop-blur-md border border-white/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                  <Ghost className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">Ghost Voice Notes</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300">
                <Mic className="h-3 w-3 animate-pulse" /> Live Modulator
              </span>
            </div>

            {/* Audio Wave Simulation */}
            <div className="mt-2.5 flex items-center gap-1.5 px-1 py-1">
              {[40, 75, 50, 95, 60, 30, 85, 100, 45, 70, 90, 35, 65, 80, 55].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full bg-white/80 transition-all duration-300"
                  style={{ height: `${Math.max(12, h * 0.28)}px` }}
                />
              ))}
            </div>

            {/* Filter chips */}
            <div className="mt-2.5 grid grid-cols-4 gap-1">
              {GHOST_EFFECTS.map((eff) => (
                <div
                  key={eff.id}
                  className="rounded-lg bg-white/10 px-1.5 py-1 text-center text-[10px] font-medium text-white/90"
                >
                  {eff.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5 px-6 pt-5">
          <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">1. Apna link share karein</p>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Instagram bio, WhatsApp story ya status par daalein. Har user ka permanent unique link hota hai.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">2. 100% Anonymous & Zero Login</p>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Guest bas nickname chunega aur turant baat shuru — koi phone number ya password required nahi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">3. Live Real-time Inbox</p>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Saare secret messages aapke Buzz Guest Inbox mein aate hain jahan se aap live reply kar sakte hain.
              </p>
            </div>
          </div>

          {/* Quick Copy Link Box */}
          {username && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-[11px] font-semibold text-primary mb-1.5 flex items-center gap-1">
                <Link2 className="h-3 w-3" /> Aapka Personal Link:
              </p>
              <div className="flex items-center justify-between gap-2 rounded-xl bg-background border border-border px-3 py-2 text-xs">
                <span className="truncate font-mono text-muted-foreground select-all">{link}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(link, "link")}
                  className="h-7 shrink-0 px-2 text-primary hover:bg-primary/10"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="ml-1 text-[11px]">{copiedLink ? "Copied!" : "Copy"}</span>
                </Button>
              </div>

              {/* QR Code Accordion Button */}
              <button
                onClick={() => setShowQR(!showQR)}
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>{showQR ? "QR Code chhupayein" : "Scan karne ke liye QR Code dekhein"}</span>
                {showQR ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {/* QR Code Display */}
              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white p-4 shadow-inner"
                  >
                    <QRCodeSVG
                      value={link}
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                    <p className="mt-2 font-mono text-[11px] font-bold text-gray-800">@{username}</p>
                    <p className="text-[10px] text-gray-500">Camera se scan karke baat shuru karein</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 p-6 pt-3">
          <Button asChild className="gradient-brand shadow-sm text-xs font-semibold h-10">
            <a href={`https://wa.me/?text=${encodeURIComponent(statusCaption)}`} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp Status
            </a>
          </Button>

          <Button
            variant="outline"
            onClick={() => copyToClipboard(statusCaption, "status")}
            className="text-xs font-semibold h-10 border-border"
          >
            {copiedStatus ? <Check className="mr-1.5 h-4 w-4 text-emerald-500" /> : <Copy className="mr-1.5 h-4 w-4" />}
            {copiedStatus ? "Copied!" : "Copy Status"}
          </Button>

          <Button variant="ghost" className="col-span-2 text-xs font-semibold text-primary hover:bg-primary/10 h-9" asChild>
            <a href="/guests">
              <Inbox className="mr-1.5 h-4 w-4" /> Guest Inbox kholo
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
