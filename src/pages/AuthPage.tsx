// src/pages/AuthPage.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, User, Lock, Eye, EyeOff, Sparkles, QrCode, KeyRound, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";
import buzzLogo from "@/assets/buzz-logo.jpeg";
import { QRCodeSVG } from "qrcode.react";

interface AuthPageProps {
  onAuth: () => void;
  embedded?: boolean;
}

const AuthPage = ({ onAuth, embedded = false }: AuthPageProps) => {
  const params = new URLSearchParams(window.location.search);
  const initialUsername = embedded ? "" : (params.get("username") || "").replace(/^@/, "");
  const startSignup = !embedded && (params.get("mode") === "signup" || !!initialUsername);
  
  const [isLogin, setIsLogin] = useState(!startSignup);
  const [authMethod, setAuthMethod] = useState<"password" | "qr">("password");
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // QR Session ID generation for WhatsApp-Web style login
  const [sessionId, setSessionId] = useState<string>(() => "bz_" + Math.random().toString(36).substring(2, 10));
  const [qrCountdown, setQrCountdown] = useState(120);

  // Auto-generate fresh QR code
  const refreshQR = () => {
    setSessionId("bz_" + Math.random().toString(36).substring(2, 10));
    setQrCountdown(120);
  };

  // Realtime WebSocket Listener for WhatsApp Web QR Pairing
  useEffect(() => {
    if (!isLogin || authMethod !== "qr") return;

    const channel = supabase.channel(`buzz-web-pair:${sessionId}`);

    channel
      .on("broadcast", { event: "auth-grant" }, async ({ payload }) => {
        if (payload?.access_token && payload?.refresh_token) {
          toast.success("Phone paired successfully! Logging in... 🚀");
          const { error: sessionErr } = await supabase.auth.setSession({
            access_token: payload.access_token,
            refresh_token: payload.refresh_token,
          });

          if (!sessionErr) {
            onAuth();
          } else {
            toast.error("Pairing session expired. Please refresh QR.");
          }
        }
      })
      .subscribe();

    // 2-minute countdown timer
    const interval = setInterval(() => {
      setQrCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [isLogin, authMethod, sessionId, onAuth]);

  const normalizeUsername = (val: string) =>
    val.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const toEmail = (val: string) => (isEmail(val) ? val.trim().toLowerCase() : `${normalizeUsername(val)}@buzzofficial.app`);

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
        let { error: loginErr } = await supabase.auth.signInWithPassword({
          email: toEmail(raw),
          password,
        });

        if (loginErr && !isEmail(raw)) {
          const fallback = await supabase.auth.signInWithPassword({
            email: `${normalizeUsername(raw)}@buzz.local`,
            password,
          });
          if (!fallback.error) loginErr = null;
        }

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

  const pairingPayload = JSON.stringify({
    type: "buzz-web-login",
    sessionId,
    url: `https://chat-without-digits.lovable.app/pair?s=${sessionId}`,
  });

  return (
    <div className={`flex w-full items-center justify-center bz-grid-paper p-6 ${embedded ? "min-h-[580px] rounded-2xl" : "min-h-screen"}`}>
      <div className="w-full max-w-sm rounded-3xl border-4 border-[#0a0a0a] bg-white p-7 shadow-[0_10px_0_0_#0a0a0a] animate-fade-in">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative">
            <img
              src={buzzLogo}
              alt="Buzz"
              className="h-16 w-16 rounded-2xl border-2 border-[#0a0a0a] object-cover shadow-[0_4px_0_0_#0a0a0a]"
            />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0a0a0a] bg-[#FCE314] shadow-[0_2px_0_0_#0a0a0a]">
              <Sparkles className="h-3 w-3 text-[#0a0a0a]" />
            </div>
          </div>
          <h1 className="mt-3 text-2xl font-black text-[#0a0a0a] flex items-center gap-1.5 tracking-tight">
            {isLogin ? "Log in to " : "Join "}
            <span className="bz-squig">Buzz</span>
            <span className="text-xl" title="Made in India">🇮🇳</span>
          </h1>
          <p className="mt-0.5 text-xs font-mono font-bold text-[#5b5b55] uppercase tracking-wider">
            {isLogin ? "Username & QR Login" : "Claim your unique identity"} · Zero Digits
          </p>
        </div>

        {/* WhatsApp Web Style Tab Switcher */}
        {isLogin && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FAF9F6] border-2 border-[#0a0a0a] rounded-xl mb-4 shadow-[0_2px_0_0_#0a0a0a]">
            <button
              type="button"
              onClick={() => setAuthMethod("password")}
              className={`py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === "password"
                  ? "bg-[#FCE314] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
                  : "text-[#5b5b55] hover:text-[#0a0a0a]"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" /> Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("qr");
                refreshQR();
              }}
              className={`py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === "qr"
                  ? "bg-[#FCE314] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
                  : "text-[#5b5b55] hover:text-[#0a0a0a]"
              }`}
            >
              <QrCode className="h-3.5 w-3.5" /> Scan QR
            </button>
          </div>
        )}

        {/* Tab 1: Scan to Log In (WhatsApp Web Style) */}
        {isLogin && authMethod === "qr" ? (
          <div className="flex flex-col items-center space-y-4 animate-fade-in">
            <div className="relative rounded-2xl border-2 border-[#0a0a0a] bg-white p-3 shadow-[0_4px_0_0_#0a0a0a]">
              {qrCountdown > 0 ? (
                <QRCodeSVG value={pairingPayload} size={160} level="H" />
              ) : (
                <div className="h-[160px] w-[160px] flex flex-col items-center justify-center bg-[#FAF9F6] rounded-xl text-center p-2">
                  <p className="text-xs font-black text-red-600 mb-2">QR Code Expired</p>
                  <button
                    onClick={refreshQR}
                    className="bz-btn bz-btn-yellow px-3 py-1.5 text-[11px] font-black uppercase flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Refresh
                  </button>
                </div>
              )}
            </div>

            {qrCountdown > 0 && (
              <div className="w-full text-center space-y-2">
                <div className="rounded-lg border border-[#0a0a0a] bg-[#FFFBEA] py-1 px-2 font-mono text-xs font-black text-[#0a0a0a]">
                  Pairing PIN: {sessionId.toUpperCase()}
                </div>

                <div className="text-[11px] font-semibold text-[#5b5b55] text-left space-y-1 bg-[#FAF9F6] p-2.5 rounded-xl border border-[#0a0a0a]/15">
                  <p className="font-black text-[#0a0a0a] flex items-center gap-1">
                    <Smartphone className="h-3.5 w-3.5" /> To log in from phone:
                  </p>
                  <p>1. Open Buzz on your mobile phone</p>
                  <p>2. Go to <strong>Settings ⚙️ ➔ Linked Devices</strong></p>
                  <p>3. Tap <strong>Authorize Web</strong> & enter PIN / scan</p>
                </div>

                <p className="text-[10px] text-[#5b5b55] flex items-center justify-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Listening for phone authorization ({qrCountdown}s)
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: Username & Password */
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
                <div className="flex items-center gap-2 justify-center">
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
        )}

        <p className="mt-5 text-center text-xs font-bold text-[#5b5b55]">
          {isLogin ? "Don't have a Buzz handle?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setPassword("");
              setAuthMethod("password");
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
