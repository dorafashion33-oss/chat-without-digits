import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Smartphone, Sparkles, Image as ImageIcon, Share, PlusSquare, ArrowLeft } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import buzzLogo from "@/assets/buzz-logo.jpeg";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallAppDialogProps {
  trigger?: React.ReactNode;
}

const InstallAppDialog = ({ trigger }: InstallAppDialogProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [open, setOpen] = useState(false);
  const [installHint, setInstallHint] = useState("");
  const qrWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("install") === "1") {
      setOpen(true);
      params.delete("install");
      const qs = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash);
    }
  }, []);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      setInstallHint(isIOS
        ? "Tap Share, then Add to Home Screen."
        : "Open your browser menu and choose Install app or Add to Home screen.");
      return;
    }
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
    } catch { /* ignore */ }
    finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const appUrl = typeof window !== "undefined" ? `${window.location.origin}/?install=1` : "";

  const renderQRToCanvas = async (size = 1024): Promise<HTMLCanvasElement | null> => {
    const svg = qrWrapRef.current?.querySelector("svg");
    if (!svg) return null;
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size + 140;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }

        ctx.fillStyle = "#FFFDF6";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const pad = 60;
        const cardSize = size - pad * 2;
        const r = 40;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(pad + r, pad);
        ctx.arcTo(pad + cardSize, pad, pad + cardSize, pad + cardSize, r);
        ctx.arcTo(pad + cardSize, pad + cardSize, pad, pad + cardSize, r);
        ctx.arcTo(pad, pad + cardSize, pad, pad, r);
        ctx.arcTo(pad, pad, pad + cardSize, pad, r);
        ctx.closePath();
        ctx.fill();

        ctx.lineWidth = 8;
        ctx.strokeStyle = "#0A0A0A";
        ctx.stroke();

        ctx.drawImage(img, pad + 30, pad + 30, cardSize - 60, cardSize - 60);

        ctx.fillStyle = "#0A0A0A";
        ctx.font = "bold 56px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Scan to install Buzz 🇮🇳", size / 2, size + 90);

        resolve(canvas);
      };
      img.onerror = () => resolve(null);
      img.src = svg64;
    });
  };

  const handleDownloadQR = async () => {
    const canvas = await renderQRToCanvas(1024);
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "buzz-install-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (isInstalled) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="bz-btn bz-btn-yellow px-3 py-1.5 text-xs font-bold">
            <Download className="h-3.5 w-3.5" />
            <span>Install</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-md rounded-3xl border-4 border-[#0a0a0a] bg-white p-0 shadow-[0_12px_0_0_#0a0a0a]">
        <div className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-5 py-4">
          <DialogTitle className="flex items-center gap-2.5 text-lg font-black text-[#0a0a0a]">
            <img src={buzzLogo} alt="Buzz" className="h-8 w-8 rounded-lg border-2 border-[#0a0a0a] object-cover" />
            Install <span className="bz-squig">Buzz</span> 🇮🇳
          </DialogTitle>
        </div>

        <div className="flex flex-col items-center gap-5 p-6 bz-grid-paper">
          <div className="relative">
            <img src={buzzLogo} alt="Buzz" className="h-20 w-20 rounded-2xl border-3 border-[#0a0a0a] object-cover shadow-[0_4px_0_0_#0a0a0a]" />
            <span className="absolute -bottom-1 -right-1 text-sm">🇮🇳</span>
          </div>

          <div className="text-center">
            <p className="text-lg font-black text-[#0a0a0a]">Buzz for your device</p>
            <p className="mt-1 text-xs font-medium text-[#5b5b55]">Fast access directly from your phone's home screen.</p>
          </div>

          <button
            onClick={handleInstall}
            disabled={installing || isInstalled}
            className="bz-btn bz-btn-yellow h-12 w-full text-sm font-black uppercase tracking-wider"
          >
            <Smartphone className="h-4 w-4" />
            {isInstalled ? "Installed" : installing ? "Installing..." : "Install Buzz PWA"}
          </button>

          {installHint && (
            <div className="flex w-full items-start gap-2 rounded-xl border-2 border-[#0a0a0a] bg-[#DCF4E4] p-3 text-xs font-bold text-[#2d5a3e] shadow-[0_2px_0_0_#0a0a0a]">
              {/iphone|ipad|ipod/i.test(navigator.userAgent) ? <Share className="mt-0.5 h-4 w-4 shrink-0" /> : <PlusSquare className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>{installHint}</span>
            </div>
          )}

          <div className="flex items-center gap-3 w-full">
            <div className="h-0.5 flex-1 bg-[#0a0a0a]/20" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#5b5b55] font-black">
              Or scan with phone camera
            </span>
            <div className="h-0.5 flex-1 bg-[#0a0a0a]/20" />
          </div>

          {/* Neo-brutalist QR card */}
          <div
            ref={qrWrapRef}
            className="rounded-2xl border-3 border-[#0a0a0a] bg-white p-4 shadow-[0_5px_0_0_#0a0a0a]"
          >
            <QRCodeSVG
              value={appUrl}
              size={180}
              level="H"
              fgColor="#0a0a0a"
              bgColor="#ffffff"
            />
          </div>

          <button
            onClick={handleDownloadQR}
            className="bz-btn bz-btn-white w-full py-2.5 text-xs font-bold"
          >
            <ImageIcon className="h-4 w-4" /> Download QR Code Card
          </button>

          <button
            onClick={() => setOpen(false)}
            className="bz-btn bz-btn-ink w-full py-2 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallAppDialog;
