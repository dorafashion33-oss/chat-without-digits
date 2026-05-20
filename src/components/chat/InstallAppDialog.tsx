import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, CheckCircle2, Sparkles, Image as ImageIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import buzzLogo from "@/assets/buzz-logo.jpeg";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallAppDialog = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [open, setOpen] = useState(false);
  const qrWrapRef = useRef<HTMLDivElement>(null);

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
    if (!deferredPrompt) return;
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

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

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

        // Buzz-styled gradient background
        const grad = ctx.createLinearGradient(0, 0, size, size + 140);
        grad.addColorStop(0, "#7c3aed");
        grad.addColorStop(0.5, "#a855f7");
        grad.addColorStop(1, "#ec4899");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // White rounded card for QR
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

        // Draw QR centered in card
        ctx.drawImage(img, pad + 30, pad + 30, cardSize - 60, cardSize - 60);

        // Draw embedded logo at center
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.src = buzzLogo;
          await new Promise((res) => { logoImg.onload = res; logoImg.onerror = res; });
          const logoSize = cardSize * 0.18;
          const lx = size / 2 - logoSize / 2;
          const ly = size / 2 - logoSize / 2;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(lx - 8, ly - 8, logoSize + 16, logoSize + 16);
          ctx.save();
          ctx.beginPath();
          ctx.arc(lx + logoSize / 2, ly + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
          ctx.restore();
        } catch { /* ignore */ }

        // Footer text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 56px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Scan to install Buzz", size / 2, size + 90);

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
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground h-auto py-1.5 px-2"
        >
          <Download className="h-4 w-4" />
          <span className="text-[10px] font-medium hidden md:inline">Install</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-lg">
            <img src={buzzLogo} alt="Buzz" className="h-7 w-7 rounded-lg object-cover" />
            Install <span className="gradient-brand-text">Buzz</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-4">
          {/* Direct install button if browser supports it */}
          {deferredPrompt && (
            <Button
              onClick={handleInstall}
              disabled={installing}
              className="gradient-brand text-white px-6 py-3 rounded-2xl shadow-md hover:opacity-90 transition-opacity h-auto w-full"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              {installing ? "Installing..." : "Install on this device"}
            </Button>
          )}

          <div className="flex items-center gap-3 w-full">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Or scan with phone
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Buzz-styled QR card */}
          <div
            ref={qrWrapRef}
            className="relative rounded-3xl p-1 shadow-xl glow-purple"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)",
            }}
          >
            <div className="rounded-[20px] bg-white p-4 relative">
              <QRCodeSVG
                value={appUrl}
                size={200}
                level="H"
                fgColor="#1a0938"
                bgColor="#ffffff"
                imageSettings={{
                  src: buzzLogo,
                  height: 44,
                  width: 44,
                  excavate: true,
                }}
              />
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-foreground flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Scan with your phone camera
            </p>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              Open in browser, then tap <span className="font-medium">"Add to Home Screen"</span> to install Buzz
            </p>
          </div>

          <Button
            onClick={handleDownloadQR}
            variant="outline"
            className="w-full rounded-2xl h-auto py-2.5 border-2 hover:border-primary"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallAppDialog;
