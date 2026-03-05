import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, User, Lock, Eye, EyeOff } from "lucide-react";
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

  const fakeEmail = (uname: string) => `${uname.toLowerCase()}@buzz.local`;

  const validateUsername = (val: string) => {
    if (val.length < 3) return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(val)) return "Only letters, numbers, and underscores";
    return "";
  };

  const handleSubmit = async () => {
    const usernameErr = validateUsername(username);
    if (usernameErr) { setError(usernameErr); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error: loginErr } = await supabase.auth.signInWithPassword({
          email: fakeEmail(username),
          password,
        });
        if (loginErr) throw loginErr;
        toast.success(`Welcome back, @${username}! 🎉`);
      } else {
        const { data, error: signupErr } = await supabase.auth.signUp({
          email: fakeEmail(username),
          password,
          options: {
            data: { username, display_name: username },
          },
        });
        if (signupErr) throw signupErr;
        if (data.user) {
          toast.success(`Account created! Welcome to Buzz, @${username}! 🎉`);
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
        <div className="flex flex-col items-center text-center mb-8">
          <img src={buzzLogo} alt="Buzz" className="h-20 w-20 rounded-3xl shadow-2xl glow-purple animate-scale-in object-cover mb-4" />
          <h1 className="text-2xl font-extrabold text-foreground">
            {isLogin ? "Login to " : "Join "}<span className="gradient-brand-text">Buzz</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLogin ? "Enter your username & password" : "Create your account"}
          </p>
        </div>

        <div className="space-y-3">
          {/* Username */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-4 py-3">
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

          {/* Password */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-4 py-3">
            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Password"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && <p className="text-sm text-destructive px-1">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl gradient-brand py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 glow-purple"
          >
            {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
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
