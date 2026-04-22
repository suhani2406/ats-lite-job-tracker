import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Target, ArrowRight } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success("Welcome back");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background" data-testid="login-page">
      {/* Left panel: brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative grid-bg border-r border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md border border-border bg-card flex items-center justify-center">
            <Target size={22} weight="duotone" className="text-primary" />
          </div>
          <span className="font-display font-black text-xl tracking-tight">ATS-Lite</span>
        </div>

        <div className="space-y-6 max-w-md">
          <p className="uppercase text-xs tracking-[0.2em] text-muted-foreground font-medium">
            Job Application Tracker
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-balance">
            Turn chaos into a <span className="text-primary">pipeline</span>.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
            Track every application. Move faster through each stage. Know exactly where you stand — always.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {["Applied", "Interview", "Offer", "Rejected"].map((s, i) => (
            <div key={s} className="border border-border rounded-md p-3 bg-card/50">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Stage {i + 1}</div>
              <div className="font-display font-bold text-sm mt-1">{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-md border border-border bg-card flex items-center justify-center">
              <Target size={22} weight="duotone" className="text-primary" />
            </div>
            <span className="font-display font-black text-xl">ATS-Lite</span>
          </div>

          <p className="uppercase text-xs tracking-[0.2em] text-muted-foreground font-medium mb-3">
            Sign in
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Enter your credentials to manage your applications.
          </p>

          <form onSubmit={onSubmit} className="space-y-5" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="h-11 bg-background border-border focus-visible:ring-primary"
                data-testid="login-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="h-11 bg-background border-border focus-visible:ring-primary"
                data-testid="login-password-input"
              />
            </div>

            {error && (
              <div
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2"
                data-testid="login-error"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium group"
              data-testid="login-submit-button"
            >
              {submitting ? "Signing in…" : (
                <span className="inline-flex items-center gap-2">
                  Sign in
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium" data-testid="goto-register-link">
              Create one
            </Link>
          </div>

          <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
            <Briefcase size={14} />
            <span>Demo: admin@example.com / admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
