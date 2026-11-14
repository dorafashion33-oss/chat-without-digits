import { useEffect, useState, useRef } from "react";
import { Sparkles, Copy, Check, Link2, MessageCircle, Inbox, QrCode, Shield, Send, Users, Download, X } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const STEPS = [
  {
    icon: Link2,
    num: "1",
    title: "Apna link share karein",
    desc: "Instagram bio, WhatsApp status ya story par apna personal link daalein.",
  },
  {
    icon: Users,
    num: "2",
    title: "Dost secret message bhejein",
    desc: "Unhe koi app ya account nahi chahiye — bas link khol kar text ya Ghost Voice note bhej sakte hain.",
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

        canvas.width = 720;
        canvas.height = 880;

        // Clean cream paper background
        ctx.fillStyle = "#FFFDF6";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header yellow pill
        ctx.fillStyle = "#FCE314";
        ctx.fillRect(0, 0, canvas.width, 150);

        // Solid bottom border on header
        ctx.fillStyle = "#0A0A0A";
        ctx.fillRect(0, 146, canvas.width, 4);

        // Header Text
        ctx.fillStyle = "#0A0A0A";
        ctx.font = "900 38px monospace";
        ctx.textAlign = "center";
        ctx.fillText("BUZZ GUEST CHAT", canvas.width / 2, 75);

        ctx.fillStyle = "#5B5B55";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("Scan to chat without app or login", canvas.width / 2, 120);

        // QR Code Box
        ctx.fillStyle = "#FFFFFF";
        ctx.roundRect?.(110, 200, 500, 500, 24) || ctx.fillRect(110, 200, 500, 500);
        ctx.fill();

        // Ink border around QR box
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#0A0A0A";
        ctx.strokeRect(110, 200, 500, 500);

        // Draw QR
        ctx.drawImage(img, 150, 240, 420, 420);

        // Username Footer
        ctx.fillStyle = "#0A0A0A";
        ctx.font = "900 34px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`@${username || "user"}`, canvas.width / 2, 770);

        ctx.fillStyle = "#5B5B55";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("chat-without-digits.lovable.app", canvas.width / 2, 815);

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
      <DialogContent className="w-[94vw] max-w-md md:max-w-2xl lg:max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-0 border-4 border-[#0a0a0a] bg-white shadow-[0_12px_0_0_#0a0a0a]">
        
        {/* Header Bar */}
        <div className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-6 py-5 text-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-white px-3 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a]">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Naya Feature
            </span>
            {username && (
              <span className="rounded-full border-2 border-[#0a0a0a] bg-white px-3 py-0.5 font-mono text-xs font-bold text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]">
                @{username}
              </span>
            )}
          </div>
          <DialogTitle className="mt-2.5 text-xl md:text-2xl font-black text-[#0a0a0a] tracking-tight">
            Buzz Guest Chat Link
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs md:text-sm font-medium text-[#5b5b55]">
            Dosto se secret messages aur voice notes paayein — samne wale ko bina kisi login ya app ke!
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bz-grid-paper">
          
          {/* Left Side: 3 Steps */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <p className="bz-label mb-3">
                Ye kaise kaam karta hai?
              </p>
              <div className="space-y-3">
                {STEPS.map((s) => (
                  <div key={s.num} className="flex items-start gap-3 rounded-2xl border-2 border-[#0a0a0a] bg-white p-3.5 shadow-[0_3px_0_0_#0a0a0a]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] font-black text-sm shadow-[0_2px_0_0_#0a0a0a]">
                      {s.num}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#0a0a0a]">{s.title}</p>
                      <p className="text-xs text-[#5b5b55] leading-relaxed mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border-2 border-[#0a0a0a] bg-[#DCF4E4] p-3 text-xs font-bold text-[#2d5a3e] flex items-center gap-2 shadow-[0_2px_0_0_#0a0a0a]">
              <Shield className="h-4 w-4 text-emerald-800 shrink-0" />
              <span>100% safe & anonymous — phone number ya naam store nahi hota.</span>
            </div>
          </div>

          {/* Right Side: Link, QR Code & Share Action Hub */}
          <div className="flex flex-col justify-between space-y-4">
            
            {/* Personal Link Box */}
            <div className="rounded-2xl border-2 border-[#0a0a0a] bg-[#E2ECFF] p-4 shadow-[0_4px_0_0_#0a0a0a]">
              <p className="text-xs font-black text-[#0a0a0a] mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Link2 className="h-3.5 w-3.5 text-[#0a0a0a]" />
                Aapka Direct Chat Link:
              </p>
              
              <div className="flex items-center justify-between gap-2 rounded-xl bg-white border-2 border-[#0a0a0a] p-2 shadow-[0_2px_0_0_#0a0a0a]">
                <span className="truncate font-mono text-xs font-bold text-[#0a0a0a] select-all">
                  {link}
                </span>
                <button
                  onClick={() => copyText(link, "link")}
                  className="bz-btn bz-btn-ink px-3 py-1.5 text-xs font-bold shrink-0"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              {/* QR Code Toggle */}
              <button
                onClick={() => setShowQR(!showQR)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-black text-[#0a0a0a] hover:underline"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>{showQR ? "QR Code chhupayein" : "Scan ke liye QR Code dekhein"}</span>
              </button>

              {showQR && (
                <div ref={qrRef} className="mt-3 flex flex-col items-center justify-center rounded-2xl bg-white p-4 border-2 border-[#0a0a0a] shadow-[0_4px_0_0_#0a0a0a]">
                  <QRCodeSVG value={link} size={150} level="H" />
                  <p className="mt-2 font-mono text-xs font-black text-[#0a0a0a]">@{username}</p>
                  <p className="text-[11px] text-[#5b5b55] mb-3">Camera se scan karke direct chat khulegi</p>
                  
                  {/* Download QR Card Button */}
                  <button
                    onClick={downloadQR}
                    className="bz-btn bz-btn-yellow w-full py-2 text-xs font-black uppercase tracking-wider"
                  >
                    <Download className="h-3.5 w-3.5" /> Download QR Card (PNG)
                  </button>
                </div>
              )}
            </div>

            {/* Share Buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(statusCaption)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bz-btn bz-btn-yellow py-2.5 text-xs font-bold"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>

                <button
                  onClick={() => copyText(statusCaption, "status")}
                  className="bz-btn bz-btn-white py-2.5 text-xs font-bold"
                >
                  {copiedStatus ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedStatus ? "Copied!" : "Copy Caption"}</span>
                </button>
              </div>

              <a
                href="/guests"
                className="bz-btn bz-btn-ink w-full py-2.5 text-xs font-bold"
              >
                <Inbox className="h-3.5 w-3.5" /> Guest Inbox Kholein
              </a>
            </div>

          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
