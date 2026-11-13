import { useEffect, useState, useRef } from "react";
import { Sparkles, Copy, Check, Link2, MessageCircle, Inbox, QrCode, Shield, Send, Users, Download } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Link2,
    num: "1",
    title: "Apna link share karein",
    desc: "Instagram bio, WhatsApp status ya story par apna link daalein.",
  },
  {
    icon: Users,
    num: "2",
    title: "Dost secret message bhejein",
    desc: "Unhe koi app ya account nahi chahiye — bas link khol kar text ya aawaz badal kar audio note bhej sakte hain.",
  },
  {
    icon: Send,
    num: "3",
    title: "Aap Inbox se reply karein",
    desc: "Messages seedha aapke Buzz Guest Inbox mein aayenge, jahan se aap live reply kar sakte hain.",
  },
];

export default function NewFeatureSpotlight({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("username")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => setUsername(data?.username ?? ""));

    const t = setTimeout(() => setOpen(true), 800);

    const handleOpen = () => setOpen(true);
    window.addEventListener("buzz:open-spotlight", handleOpen);

    return () => {
      clearTimeout(t);
      window.removeEventListener("buzz:open-spotlight", handleOpen);
    };
  }, [userId]);

  const link = `${window.location.origin}/c/${username}`;
  const statusCaption = `🔥 Mujhse secret chat karo — bina app, bina login!\n🎙️ Ghost Voice mein aawaz badal ke bolo.\n👇 Link kholo:\n${link}`;

  const copyText = async (text: string, type: "link" | "status") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        toast.success("Guest link copy ho gaya!");
      } else {
        setCopiedStatus(true);
        setTimeout(() => setCopiedStatus(false), 2000);
        toast.success("Status caption copy ho gaya!");
      }
    } catch {
      toast.error("Copy nahi ho paaya");
    }
  };

  const downloadQR = () => {
    try {
      const svg = qrRef.current?.querySelector("svg");
      if (!svg) {
        toast.error("QR Code nahi mila");
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Card Size: 360 x 440 (Crisp high-res card)
        canvas.width = 720;
        canvas.height = 880;

        // Clean white/cream background
        ctx.fillStyle = "#FAF8F5";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header gradient pill
        const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0, "#8B5CF6");
        grad.addColorStop(0.5, "#6366F1");
        grad.addColorStop(1, "#EC4899");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, 140);

        // Header Text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 38px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("BUZZ GUEST CHAT", canvas.width / 2, 85);

        // Subtitle pill
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "24px sans-serif";
        ctx.fillText("Scan to chat without app or login", canvas.width / 2, 120);

        // QR Code Box (white card shadow look)
        ctx.fillStyle = "#FFFFFF";
        ctx.roundRect?.(110, 200, 500, 500, 24) || ctx.fillRect(110, 200, 500, 500);
        ctx.fill();

        // Draw QR
        ctx.drawImage(img, 150, 240, 420, 420);

        // Username Footer
        ctx.fillStyle = "#1E1B4B";
        ctx.font = "bold 34px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`@${username || "user"}`, canvas.width / 2, 770);

        ctx.fillStyle = "#6B7280";
        ctx.font = "22px sans-serif";
        ctx.fillText("chat-without-digits.lovable.app", canvas.width / 2, 815);

        // Download trigger
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `buzz-qr-${username || "guest"}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("QR Code card download ho gaya! 📸");
      };
      img.src = url;
    } catch {
      toast.error("Download fail ho gaya, dobara try karein");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[94vw] max-w-md md:max-w-2xl lg:max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-0 border border-border shadow-2xl scrollbar-thin">
        
        {/* Header Bar */}
        <div className="gradient-brand px-6 py-5 text-primary-foreground">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Naya Feature
            </span>
            {username && (
              <span className="rounded-full bg-black/20 px-3 py-0.5 font-mono text-xs font-medium text-white/90">
                @{username}
              </span>
            )}
          </div>
          <DialogTitle className="mt-2 text-xl md:text-2xl font-bold text-white">
            Buzz Guest Chat Link
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs md:text-sm text-white/90">
            Dosto se secret messages aur voice notes paayein — samne wale ko bina kisi login ya app ke!
          </DialogDescription>
        </div>

        {/* Content Body: Desktop par 2 Columns, Mobile par Single Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          
          {/* Left Side: 3 Seedhe Steps */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Ye kaise kaam karta hai?
              </p>
              <div className="space-y-3">
                {STEPS.map((s) => (
                  <div key={s.num} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                      {s.num}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-accent/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary shrink-0" />
              <span>100% safe & anonymous — unka number ya naam store nahi hota.</span>
            </div>
          </div>

          {/* Right Side: Link, QR Code & Share Action Hub */}
          <div className="flex flex-col justify-between space-y-4">
            
            {/* Personal Link Box */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-primary" />
                Aapka Direct Chat Link:
              </p>
              
              <div className="flex items-center justify-between gap-2 rounded-xl bg-background border border-border p-2.5">
                <span className="truncate font-mono text-xs text-muted-foreground select-all">
                  {link}
                </span>
                <Button
                  size="sm"
                  onClick={() => copyText(link, "link")}
                  className="h-8 shrink-0 text-xs gradient-brand"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="ml-1.5">{copiedLink ? "Copied!" : "Copy Link"}</span>
                </Button>
              </div>

              {/* QR Code Toggle */}
              <button
                onClick={() => setShowQR(!showQR)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>{showQR ? "QR Code chhupayein" : "Scan ke liye QR Code dekhein"}</span>
              </button>

              {showQR && (
                <div ref={qrRef} className="mt-3 flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-sm border border-border">
                  <QRCodeSVG value={link} size={150} level="H" />
                  <p className="mt-2 font-mono text-xs font-bold text-gray-800">@{username}</p>
                  <p className="text-[11px] text-gray-500 mb-3">Camera se scan karke direct chat khulegi</p>
                  
                  {/* Download QR Card Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadQR}
                    className="h-8 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 w-full"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download QR Card (PNG)
                  </Button>
                </div>
              )}
            </div>

            {/* Share Buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button asChild className="gradient-brand h-10 text-xs font-semibold">
                  <a href={`https://wa.me/?text=${encodeURIComponent(statusCaption)}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp Status
                  </a>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => copyText(statusCaption, "status")}
                  className="h-10 text-xs font-semibold border-border"
                >
                  {copiedStatus ? <Check className="mr-1.5 h-4 w-4 text-emerald-500" /> : <Copy className="mr-1.5 h-4 w-4" />}
                  {copiedStatus ? "Copied!" : "Copy Caption"}
                </Button>
              </div>

              <Button variant="ghost" asChild className="w-full h-10 text-xs font-semibold text-primary hover:bg-primary/10">
                <a href="/guests">
                  <Inbox className="mr-1.5 h-4 w-4" /> Guest Inbox Kholein
                </a>
              </Button>
            </div>

          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
