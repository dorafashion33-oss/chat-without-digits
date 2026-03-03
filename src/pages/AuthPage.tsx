import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, ArrowRight, Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface AuthPageProps {
  onAuth: () => void;
}

const AuthPage = ({ onAuth }: AuthPageProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (username.length < 3) {
          toast.error("Username must be at least 3 characters");
          setLoading(false);
          return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          toast.error("Username can only contain letters, numbers, and underscores");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username, display_name: username },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Check your email to verify your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth();
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground animate-scale-in shadow-lg">
            B
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "login" ? "Welcome back" : "Join"} <span className="text-primary">Buzz</span>
          </h1>
          <div className="mt-1 flex items-center gap-1 text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs">Encrypted · Fast · Beautiful</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                required
              />
            </div>
          )}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              required
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              required
              minLength={6}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-semibold text-primary hover:underline">
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
