import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, User, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";
import buzzLogo from "@/assets/buzz-logo.jpeg";

interface AuthPageProps {
  onAuth: () => void;
}

const AuthPage = ({ onAuth }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fakeEmail = (uname: string) => `${uname.toLowerCase().trim()}@buzz.local`;

  const validateUsername = (val: string) => {
    if (val.trim().length < 3) return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(val.trim())) return "Only letters, numbers, and underscores";
    return "";
  };

  const handleSubmit = async () => {
    const trimmedUsername = username.trim();
    const usernameErr = validateUsername(trimmedUsername);
    if (usernameErr) { setError(usernameErr); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error: loginErr } = await supabase.auth.signInWithPassword({
          email: fakeEmail(trimmedUsername),
          password,
        });
        if (loginErr) throw loginErr;
        toast.success(`Welcome back, @${trimmedUsername}! 🎉`);
      } else {
        const { data, error: signupErr } = await supabase.auth.signUp({
          email: fakeEmail(trimmedUsername),
          password,
          options: {
            data: { username: trimmedUsername, display_name: trimmedUsername },
          },
        });
        if (signupErr) throw signupErr;
        if (data.user) {
          // Auto-confirm is enabled, so user is immediately signed in
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
    <div className="flex h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative">
            <img src={buzzLogo} alt="Buzz" className="h-20 w-20 rounded-3xl shadow-2xl glow-purple animate-scale-in object-cover" />
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full gradient-brand shadow-md">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-foreground">
            {isLogin ? "Welcome back to " : "Join "}<span className="gradient-brand-text">Buzz</span>
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isLogin ? "Sign in with your username" : "Create your unique identity"}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/60 px-4 py-3.5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              placeholder="Username"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/60 px-4 py-3.5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Password"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 px-3 py-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-brand py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 glow-purple"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); setPassword(""); }}
            className="font-semibold gradient-brand-text hover:underline"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
