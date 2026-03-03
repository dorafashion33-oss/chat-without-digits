import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Sparkles, User, MessageCircle, CircleDot, Phone } from "lucide-react";
import { toast } from "sonner";
import buzzLogo from "@/assets/buzz-logo.jpeg";

interface AuthPageProps {
  onAuth: () => void;
}

const AuthPage = ({ onAuth }: AuthPageProps) => {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateUsername = (val: string) => {
    if (val.length < 3) return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(val)) return "Only letters, numbers, and underscores";
    return "";
  };

  const handleNext = async () => {
    if (step === 0) {
      setStep(1);
      return;
    }

    if (step === 1) {
      const err = validateUsername(username);
      if (err) { setError(err); return; }
      setStep(2);
      return;
    }

    if (step === 2) {
      setLoading(true);
      try {
        // Sign in anonymously
        const { data, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) throw anonError;

        // Update user metadata with username
        if (data.user) {
          await supabase.auth.updateUser({
            data: { username, display_name: username }
          });

          // Update profile
          await supabase.from("profiles").update({
            username,
            display_name: username,
          }).eq("user_id", data.user.id);
        }

        toast.success(`Welcome to Buzz, @${username}! 🎉`);
        onAuth();
      } catch (err: any) {
        toast.error(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };

  const features = [
    { icon: MessageCircle, label: "Streams", desc: "Real-time messaging with smart filters", color: "text-blue-400", bg: "bg-blue-500/15" },
    { icon: CircleDot, label: "Moments", desc: "Share 24-hour stories with friends", color: "text-purple-400", bg: "bg-purple-500/15" },
    { icon: Phone, label: "Connect", desc: "Voice & video calls with quick dial", color: "text-pink-400", bg: "bg-pink-500/15" },
  ];

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-md animate-fade-in">
        {step === 0 && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 relative">
              <img src={buzzLogo} alt="Buzz" className="h-24 w-24 rounded-3xl shadow-2xl glow-purple animate-scale-in object-cover" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Welcome to <span className="gradient-brand-text">Buzz</span>
            </h1>
            <p className="mt-3 text-muted-foreground">Your smart communication platform for 2026 and beyond</p>
            <div className="mt-2 flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium gradient-brand-text">Encrypted · Fast · Beautiful</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full gradient-brand">
              <User className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Choose your username</h2>
            <p className="mt-2 text-sm text-muted-foreground">This is how others will find you on Buzz</p>
            <div className="mt-6 w-full">
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="e.g. coolbuzzer"
                className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-center text-base outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
              {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-foreground">Hey, @{username}! 🎉</h2>
            <p className="mt-2 text-sm text-muted-foreground">Here's what you can do on Buzz</p>
            <div className="mt-6 w-full space-y-3">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-3.5 text-left animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.bg}`}>
                      <Icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl gradient-brand py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 glow-purple"
        >
          {loading ? "Setting up..." : step === 2 ? "Start Buzzing" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="mt-5 flex justify-center gap-2">
          {[0, 1, 2].map((s) => (
            <div key={s} className={`h-2 rounded-full transition-all duration-300 ${s === step ? "w-6 gradient-brand" : "w-2 bg-muted-foreground/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
