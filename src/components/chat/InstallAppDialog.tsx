import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Monitor, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useIsMobile } from "@/hooks/use-mobile";

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
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

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
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Download className="h-4 w-4" />
          <span className="text-xs">Install App</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5 text-primary" />
            Install Buzz
          </DialogTitle>
        </DialogHeader>

        {isInstalled ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Buzz is already installed on this device!
            </p>
          </div>
        ) : isMobile ? (
          /* Mobile: Direct install button */
          <div className="flex flex-col items-center gap-5 py-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-brand shadow-lg">
              <Smartphone className="h-10 w-10 text-white" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">
                Install Buzz on your phone
              </p>
              <p className="text-xs text-muted-foreground max-w-[280px]">
                Get the full app experience with quick access from your home screen
              </p>
            </div>
            {deferredPrompt ? (
              <Button
                onClick={handleInstall}
                disabled={installing}
                className="gradient-brand text-white px-8 py-3 rounded-xl shadow-md hover:opacity-90 transition-opacity"
              >
                <Download className="h-4 w-4 mr-2" />
                {installing ? "Installing..." : "Install Now"}
              </Button>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  Tap your browser's menu and select
                </p>
                <div className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2">
                  <span className="text-sm font-medium text-accent-foreground">
                    "Add to Home Screen"
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Desktop: QR code for phone install */
          <div className="flex flex-col items-center gap-5 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <Monitor className="h-8 w-8 text-accent-foreground" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">
                Scan to install on your phone
              </p>
              <p className="text-xs text-muted-foreground max-w-[280px]">
                Open your phone camera and scan this QR code to install Buzz
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
              After scanning, tap "Add to Home Screen" in your browser menu
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InstallAppDialog;
