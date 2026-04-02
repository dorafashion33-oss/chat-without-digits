import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Monitor, CheckCircle2, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useIsMobile } from "@/hooks/use-mobile";
import buzzLogo from "@/assets/buzz-logo.jpeg";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallAppDialog = () => {
  const isMobile = useIsMobile();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [open, setOpen] = useState(false);

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
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch {
      // ignore
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

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
            Install Buzz
          </DialogTitle>
        </DialogHeader>

        {isInstalled ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-online/15">
              <CheckCircle2 className="h-8 w-8 text-online" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Buzz is already installed on this device! 🎉
            </p>
          </div>
        ) : isMobile ? (
          <div className="flex flex-col items-center gap-5 py-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-brand shadow-lg glow-purple">
              <Smartphone className="h-10 w-10 text-white" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">Install Buzz on your phone</p>
              <p className="text-xs text-muted-foreground max-w-[280px]">
                Get quick access from your home screen with the full app experience
              </p>
            </div>
            {deferredPrompt ? (
              <Button
                onClick={handleInstall}
                disabled={installing}
                className="gradient-brand text-white px-8 py-3 rounded-2xl shadow-md hover:opacity-90 transition-opacity h-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                {installing ? "Installing..." : "Install Now"}
              </Button>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-xs text-muted-foreground">Tap your browser's menu and select</p>
                <div className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-accent-foreground">"Add to Home Screen"</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <Monitor className="h-8 w-8 text-accent-foreground" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">Scan to install on your phone</p>
              <p className="text-xs text-muted-foreground max-w-[280px]">
                Open your phone camera and scan this QR code
              </p>
            </div>
            <div className="rounded-2xl border-2 border-border bg-white p-4 shadow-sm">
              <QRCodeSVG
                value={appUrl}
                size={180}
                level="M"
                fgColor="#7c3aed"
                bgColor="#ffffff"
              />
            </div>
            <p className="text-[11px] text-muted-foreground text-center max-w-[260px]">
              After scanning, tap "Add to Home Screen" in your browser
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InstallAppDialog;
