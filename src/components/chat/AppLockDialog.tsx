import { useState, useEffect } from "react";
import { Lock, Delete, Shield, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const PIN_STORAGE_KEY = "buzz:app-pin-hash";

const hashPin = async (pin: string) => {
  const enc = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const isAppLockEnabled = () => {
  return localStorage.getItem("buzz-app-lock") === "1" && !!localStorage.getItem(PIN_STORAGE_KEY);
};

export const setupAppPin = async (pin: string) => {
  const h = await hashPin(pin);
  localStorage.setItem(PIN_STORAGE_KEY, h);
  localStorage.setItem("buzz-app-lock", "1");
  toast.success("4-Digit PIN Lock Activated! 🔒");
};

export default function AppLockDialog() {
  const [locked, setLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isAppLockEnabled()) {
      setLocked(true);
    }
  }, []);

  const handleDigit = async (d: string) => {
    if (enteredPin.length >= 4) return;
    const next = enteredPin + d;
    setEnteredPin(next);
    setError(false);

    if (next.length === 4) {
      const storedHash = localStorage.getItem(PIN_STORAGE_KEY);
      const inputHash = await hashPin(next);
      if (storedHash === inputHash) {
        setLocked(false);
        setEnteredPin("");
        toast.success("Buzz Unlocked ✨");
      } else {
        setError(true);
        setTimeout(() => setEnteredPin(""), 400);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((p) => p.slice(0, -1));
    setError(false);
  };

  if (!locked) return null;

  return (
    <Dialog open={locked} onOpenChange={() => {}}>
      <DialogContent className="max-w-xs overflow-hidden p-6 rounded-3xl border-4 border-[#0a0a0a] bg-white shadow-[0_10px_0_0_#0a0a0a] text-center" onPointerDownOutside={(e) => e.preventDefault()}>
        <div className="grid h-14 w-14 mx-auto place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FFF6B8] shadow-[0_2px_0_0_#0a0a0a] mb-3">
          <Lock className="h-6 w-6 text-[#0a0a0a]" />
        </div>
        <DialogTitle className="text-lg font-black text-[#0a0a0a]">Buzz App Lock</DialogTitle>
        <p className="text-xs text-[#5b5b55] mt-1 mb-5">Enter your 4-digit PIN to continue</p>

        {/* PIN Dots */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full border-2 border-[#0a0a0a] transition-all ${
                enteredPin.length > i ? "bg-[#FCE314]" : "bg-white"
              } ${error ? "border-red-600 bg-red-200 animate-shake" : ""}`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0"].map((key, idx) => {
            if (key === "") return <div key={idx} />;
            return (
              <button
                key={key}
                onClick={() => handleDigit(key)}
                className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-base font-black shadow-[0_2px_0_0_#0a0a0a] active:translate-y-0.5 active:shadow-none hover:bg-[#FFF6B8]"
              >
                {key}
              </button>
            );
          })}
          <button
            onClick={handleDelete}
            className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-sm font-black shadow-[0_2px_0_0_#0a0a0a] hover:bg-red-50"
          >
            <Delete className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
