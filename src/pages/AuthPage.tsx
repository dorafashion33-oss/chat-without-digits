import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, User, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";
import buzzLogo from "@/assets/buzz-logo.jpeg";

interface AuthPageProps {
  onAuth: () => void;
  embedded?: boolean;
}

const AuthPage = ({ onAuth, embedded = false }: AuthPageProps) => {
  const params = new URLSearchParams(window.location.search);
  const initialUsername = embedded ? "" : (params.get("username") || "").replace(/^@/, "");
  const startSignup = !embedded && (params.get("mode") === "signup" || !!initialUsername);
  const [isLogin, setIsLogin] = useState(!startSignup);
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeUsername = (val: string) =>
    val.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const toEmail = (val: string) => (isEmail(val) ? val.trim().toLowerCase() : `${normalizeUsername(val)}@buzz.local`);

  const handleSubmit = async () => {
    const raw = username.trim();
    const trimmedUsername = isEmail(raw) ? raw.split("@")[0].toLowerCase() : normalizeUsername(raw);
    if (!isEmail(raw) && trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters (letters, numbers, underscore)");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error: loginErr } = await supabase.auth.signInWithPassword({
          email: toEmail(raw),
          password,
        });
        if (loginErr) throw loginErr;
        toast.success(`Welcome back, @${trimmedUsername}! 🎉`);
      } else {
        const { data, error: signupErr } = await supabase.auth.signUp({
          email: toEmail(raw),
          password,
          options: {
            data: { username: trimmedUsername, display_name: trimmedUsername },
          },
        });
        if (signupErr) throw signupErr;
        if (data.user) {
          toast.success(`Account created! Welcome to Buzz, @${trimmedUsername}! 🚀`);
        }
      }
      onAuth();
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      if (msg.includes("Invalid login")) {
        setError("Wrong username or password");
      } else if (msg.includes("already been registered") || msg.includes("already registered")) {
        setError("Username already taken. Try logging in.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex w-full items-center justify-center bz-grid-paper p-6 ${embedded ? "min-h-[580px] rounded-2xl" : "min-h-screen"}`}>
      <div className="w-full max-w-sm rounded-3xl border-4 border-[#0a0a0a] bg-white p-7 shadow-[0_10px_0_0_#0a0a0a] animate-fade-in">
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="relative">
            <img
              src={buzzLogo}
              alt="Buzz"
              className="h-20 w-20 rounded-2xl border-2 border-[#0a0a0a] object-cover shadow-[0_4px_0_0_#0a0a0a]"
            />
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0a0a0a] bg-[#FCE314] shadow-[0_2px_0_0_#0a0a0a]">
              <Sparkles className="h-3.5 w-3.5 text-[#0a0a0a]" />
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-black text-[#0a0a0a] flex items-center gap-1.5 tracking-tight">
            {isLogin ? "Log in to " : "Join "}
            <span className="bz-squig">Buzz</span>
            <span className="text-xl" title="Made in India">🇮🇳</span>
          </h1>
          <p className="mt-1 text-xs font-mono font-bold text-[#5b5b55] uppercase tracking-wider">
            {isLogin ? "Sign in with your @username" : "Claim your unique identity"} · Zero Digits
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-3 rounded-xl border-2 border-[#0a0a0a] bg-white px-3.5 py-3 shadow-[0_2px_0_0_#0a0a0a] transition-all focus-within:shadow-[0_4px_0_0_#0a0a0a] focus-within:bg-[#fffdf6]">
            <User className="h-4 w-4 text-[#0a0a0a] flex-shrink-0" />
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Username or @handle"
              className="flex-1 bg-transparent text-sm font-semibold text-[#0a0a0a] outline-none placeholder:text-[#0a0a0a]/40"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border-2 border-[#0a0a0a] bg-white px-3.5 py-3 shadow-[0_2px_0_0_#0a0a0a] transition-all focus-within:shadow-[0_4px_0_0_#0a0a0a] focus-within:bg-[#fffdf6]">
            <Lock className="h-4 w-4 text-[#0a0a0a] flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Password (min. 6 characters)"
              className="flex-1 bg-transparent text-sm font-semibold text-[#0a0a0a] outline-none placeholder:text-[#0a0a0a]/40"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#0a0a0a]/60 hover:text-[#0a0a0a] transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <div className="rounded-xl border-2 border-red-600 bg-red-100 px-3 py-2 text-xs font-bold text-red-900 shadow-[0_2px_0_0_#0a0a0a]">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bz-btn bz-btn-yellow w-full py-3.5 text-sm font-black uppercase tracking-wider"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-[#0a0a0a] border-t-transparent animate-spin" />
                Please wait...
              </div>
            ) : (
              <>
                {isLogin ? "Log In" : "Create Account"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Toggle Mode */}
        <p className="mt-6 text-center text-xs font-bold text-[#5b5b55]">
          {isLogin ? "Don't have a Buzz handle?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setPassword("");
            }}
            className="text-[#0a0a0a] underline underline-offset-4 hover:text-black font-extrabold"
          >
            {isLogin ? "Claim @username" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
