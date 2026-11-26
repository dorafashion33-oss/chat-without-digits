// src/pages/AuthPage.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, User, Lock, Eye, EyeOff, Sparkles, QrCode, RefreshCw } from "lucide-react";
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
    const [authMethod, setAuthMethod] = useState<"password" | "qr">(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768 && !params.get("mode")) {
      return "qr";
    }
    return "password";
  });
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    // Unique 6-character clean PIN for this computer screen
  const [pinCode, setPinCode] = useState<string>(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [qrCountdown, setQrCountdown] = useState(120);
  const [isPairingLoggingIn, setIsPairingLoggingIn] = useState(false);

  const refreshQR = () => {
    setPinCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    setQrCountdown(120);
  };

  // Realtime WebSocket Listener: Phone scan/PIN hote hi instant login with loading screen
  useEffect(() => {
    if (!isLogin || authMethod !== "qr") return;

    const channelName = `buzz-web-pair:${pinCode.toLowerCase()}`;
    const channel = supabase.channel(channelName);

    channel
            .on("broadcast", { event: "auth-grant" }, async ({ payload }) => {
        if (payload?.access_token && payload?.refresh_token) {
          setIsPairingLoggingIn(true);
          toast.success("Phone paired successfully! Welcome to Buzz 🚀");

          // Save exact device ID on this laptop so phone can disconnect it remotely
          localStorage.setItem("buzz:current-device-id", `dev_web_${pinCode.toLowerCase()}`);

          try {
            const { error: sessionErr } = await supabase.auth.setSession({
              access_token: payload.access_token,
              refresh_token: payload.refresh_token,
            });

            if (!sessionErr) {
              setTimeout(() => {
                onAuth();
              }, 400);
            } else {
              setIsPairingLoggingIn(false);
              toast.error("Pairing session expired. Please reload QR.");
            }
          } catch {
            setIsPairingLoggingIn(false);
          }
        }
      })
      .subscribe();

    const interval = setInterval(() => {
      setQrCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [isLogin, authMethod, pinCode, onAuth]);

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
    sessionId: pinCode,
    url: `https://buzzofficial.vercel.app/pair?s=${pinCode}`,
  });

  return (
    <div className={`flex w-full items-center justify-center bz-grid-paper p-4 md:p-8 ${embedded ? "min-h-[580px] rounded-2xl" : "min-h-screen"}`}>
      
      {/* ── 1. DEDICATED DESKTOP WHATSAPP-WEB STYLE TERMINAL (Only on Desktop) ── */}
      {isLogin && authMethod === "qr" ? (
        <div className="hidden md:flex w-full max-w-4xl rounded-3xl border-4 border-[#0a0a0a] bg-white p-10 shadow-[0_12px_0_0_#0a0a0a] animate-fade-in gap-10 items-center justify-between">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <img
                src={buzzLogo}
                alt="Buzz"
                className="h-14 w-14 rounded-2xl border-2 border-[#0a0a0a] object-cover shadow-[0_3px_0_0_#0a0a0a]"
              />
              <div>
                <h1 className="text-2xl font-black text-[#0a0a0a] flex items-center gap-2">
                  Use Buzz on your <span className="bz-squig">Computer</span> 🇮🇳
                </h1>
                <p className="text-xs font-mono font-bold text-[#5b5b55] uppercase">
                  Zero Phone Numbers · 100% Private Web Messaging
                </p>
              </div>
            </div>

            <ol className="space-y-4 text-sm font-bold text-[#0a0a0a] pt-2">
              <li className="flex items-start gap-3">
                <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full border-2 border-[#0a0a0a] bg-[#FFF6B8] text-xs font-black">
                  1
                </span>
                <span>Open <strong>Buzz</strong> on your mobile phone</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full border-2 border-[#0a0a0a] bg-[#FFF6B8] text-xs font-black">
                  2
                </span>
                <span>Go to <strong>Settings ⚙️ ➔ Linked Devices (Buzz Connect)</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full border-2 border-[#0a0a0a] bg-[#FFF6B8] text-xs font-black">
                  3
                </span>
                <span>Tap <strong>"Link a New Device"</strong> and scan this QR code or enter PIN</span>
              </li>
            </ol>

            <div className="pt-4 border-t-2 border-[#0a0a0a]/10">
              <button
                onClick={() => setAuthMethod("password")}
                className="text-xs font-black text-[#0a0a0a] underline hover:text-[#E85A1C]"
              >
                ← Or Log in with @username & password
              </button>
            </div>
          </div>

                    <div className="flex flex-col items-center justify-center border-l-2 border-[#0a0a0a]/10 pl-10 space-y-4">
            <div className="relative rounded-3xl border-3 border-[#0a0a0a] bg-white p-5 shadow-[0_6px_0_0_#0a0a0a]">
              {isPairingLoggingIn ? (
                <div className="h-[220px] w-[220px] flex flex-col items-center justify-center bg-[#FAF9F6] rounded-2xl text-center p-4 space-y-3">
                  <div className="h-10 w-10 rounded-full border-4 border-[#0a0a0a] border-t-transparent animate-spin"></div>
                  <p className="text-sm font-black text-[#0a0a0a]">Device Authorized! 🚀</p>
                  <p className="text-xs font-bold text-[#5b5b55]">Logging in to Buzz...</p>
                </div>
              ) : qrCountdown > 0 ? (
                <QRCodeSVG value={pairingPayload} size={220} level="H" />
              ) : (
                <div className="h-[220px] w-[220px] flex flex-col items-center justify-center bg-[#FAF9F6] rounded-2xl text-center p-4">
                  <p className="text-sm font-black text-red-600 mb-2">QR Code Expired</p>
                  <button
                    onClick={refreshQR}
                    className="bz-btn bz-btn-yellow px-4 py-2 text-xs font-black uppercase flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reload QR
                  </button>
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 text-lg" title="Made in India">
                🇮🇳
              </span>
            </div>

            {qrCountdown > 0 && !isPairingLoggingIn && (
              <div className="text-center space-y-1.5">
                <div className="rounded-lg border-2 border-[#0a0a0a] bg-[#FFFBEA] py-1.5 px-4 font-mono text-sm font-black text-[#0a0a0a] tracking-widest shadow-[0_2px_0_0_#0a0a0a]">
                  PIN: {pinCode}
                </div>
                <p className="text-[11px] font-semibold text-[#5b5b55] flex items-center justify-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Listening for scan or PIN ({qrCountdown}s)
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── 2. STANDARD LOGIN CARD (Mobile par clean, Desktop par QR switch button ke sath) ── */
                <div className="w-full max-w-sm rounded-3xl border-4 border-[#0a0a0a] bg-white p-7 shadow-[0_10px_0_0_#0a0a0a] animate-fade-in relative overflow-hidden">
          {/* 🇮🇳 Tiranga Ambient Top Indicator Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

          <div className="flex flex-col items-center text-center mb-5">
            <div className="relative">
              <div className="p-1 rounded-2xl bg-gradient-to-tr from-[#FF9933] via-white to-[#138808] border-2 border-[#0a0a0a] shadow-[0_4px_0_0_#0a0a0a]">
                <img
                  src={buzzLogo}
                  alt="Buzz"
                  className="h-14 w-14 rounded-xl object-cover"
                />
              </div>
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
              {isLogin ? "Username Identity" : "Claim your unique identity"} · Zero Digits
            </p>
          </div>

          {/* Desktop Only QR Switcher Button */}
          {isLogin && (
            <button
              type="button"
              onClick={() => {
                setAuthMethod("qr");
                refreshQR();
              }}
              className="hidden md:flex w-full mb-4 py-2 px-3 items-center justify-center gap-2 rounded-xl border-2 border-[#0a0a0a] bg-[#FFFBEA] text-xs font-black text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
            >
              <QrCode className="h-4 w-4" /> Scan QR with Phone (Buzz Web) ➔
            </button>
          )}

          {/* Username & Password Form */}
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
              className="bz-btn bz-btn-yellow w-full py-3.5 text-sm font-black uppercase tracking-wider shadow-[0_5px_0_0_#0a0a0a] active:translate-y-1"
            >
              {loading ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="h-4 w-4 rounded-full border-2 border-[#0a0a0a] border-t-transparent animate-spin" />
                  Please wait...
                </div>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2 font-black tracking-wider">
                  {isLogin ? "Log In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>

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
      )}
    </div>
  );
};

export default AuthPage;
