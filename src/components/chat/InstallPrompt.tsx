import { useState, useEffect } from "react";
import { X, Download, Smartphone, Sparkles, Shield, Zap, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import buzzLogo from "@/assets/buzz-logo.jpeg";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPrompt = () => {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed recently
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const dismissed = localStorage.getItem("buzz_install_dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 24 * 60 * 60 * 1000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show popup after a brief delay for smooth entry
    const timer = setTimeout(() => setShow(true), 800);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
      }
    } catch {
      // ignore
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("buzz_install_dismissed", String(Date.now()));
  };

  const features = [
    { icon: MessageCircle, text: "Instant Messaging" },
    { icon: Shield, text: "Secure & Private" },
    { icon: Zap, text: "Lightning Fast" },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-3xl bg-card border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient header */}
            <div className="relative h-32 gradient-brand flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white/10"
                    style={{
                      width: `${60 + i * 30}px`,
                      height: `${60 + i * 30}px`,
                      top: `${10 + i * 15}%`,
                      left: `${10 + i * 18}%`,
                    }}
                  />
                ))}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, damping: 15 }}
                className="relative"
              >
                <img
                  src={buzzLogo}
                  alt="Buzz"
                  className="h-20 w-20 rounded-2xl object-cover shadow-xl ring-4 ring-white/30"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center"
                >
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </motion.div>
              </motion.div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="text-center space-y-1.5">
                <h2 className="text-xl font-bold text-foreground">
                  Install <span className="gradient-brand-text">Buzz</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  Chat without phone numbers — fast, secure & private
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex justify-center gap-2 flex-wrap">
                {features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5"
                  >
                    <f.icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium text-accent-foreground">{f.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Install button */}
              {deferredPrompt ? (
                <Button
                  onClick={handleInstall}
                  disabled={installing}
                  className="w-full h-12 gradient-brand text-white rounded-2xl text-base font-semibold shadow-lg hover:opacity-90 transition-opacity"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {installing ? "Installing..." : "Install Buzz"}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={handleDismiss}
                    className="w-full h-12 gradient-brand text-white rounded-2xl text-base font-semibold shadow-lg hover:opacity-90 transition-opacity"
                  >
                    <Smartphone className="h-5 w-5 mr-2" />
                    Add to Home Screen
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Tap your browser menu → "Add to Home Screen"
                  </p>
                </div>
              )}

              <button
                onClick={handleDismiss}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
