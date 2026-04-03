import { useState, useEffect } from "react";
import { Download, Smartphone, Sparkles, ArrowRight } from "lucide-react";
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
    // Check if already installed as standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    // If installed, never show
    if (isStandalone) return;

    // Always show - no dismiss check, mandatory until installed
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show immediately
    const timer = setTimeout(() => setShow(true), 100);

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
      if (outcome === "accepted") setShow(false);
    } catch {
      // ignore
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleContinue = () => {
    // Only allow continue to website, but show again next visit
    setShow(false);
    // Do NOT save to localStorage - will show again on next visit
  };

  // If standalone mode, never render
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://"));

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
            className="flex flex-col items-center w-full max-w-sm px-6"
          >
            {/* Logo with sparkle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, damping: 15 }}
              className="relative mb-6"
            >
              <img
                src={buzzLogo}
                alt="Buzz"
                className="h-20 w-20 rounded-2xl object-cover shadow-xl"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
              >
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 mb-1"
            >
              Welcome to{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)" }}
              >
                Buzz
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-gray-500 mb-8"
            >
              Install Buzz for the best experience
            </motion.p>

            {/* Install Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full space-y-3"
            >
              {deferredPrompt ? (
                <Button
                  onClick={handleInstall}
                  disabled={installing}
                  className="w-full h-12 rounded-xl text-white text-base font-semibold shadow-lg border-0"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)" }}
                >
                  <Download className="h-5 w-5 mr-2" />
                  {installing ? "Installing..." : "Install App"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleContinue}
                  className="w-full h-12 rounded-xl text-white text-base font-semibold shadow-lg border-0"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)" }}
                >
                  <Smartphone className="h-5 w-5 mr-2" />
                  Add to Home Screen
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}

              {!deferredPrompt && (
                <p className="text-[11px] text-center text-gray-400">
                  Tap your browser menu → "Add to Home Screen"
                </p>
              )}
            </motion.div>

            {/* Continue to website - NOT skip, will show again */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={handleContinue}
              className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Continue to website
            </motion.button>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-1 text-[10px] text-gray-300"
            >
              You'll see this again until you install Buzz
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
