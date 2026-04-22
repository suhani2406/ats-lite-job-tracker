import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, ArrowRight } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await register(form.name, form.email, form.password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success("Account created");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-bg p-6" data-testid="register-page">
      <div className="w-full max-w-md border border-border bg-card/80 backdrop-blur-sm rounded-lg p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-md border border-border bg-background flex items-center justify-center">
            <Target size={22} weight="duotone" className="text-primary" />
          </div>
          <span className="font-display font-black text-xl">ATS-Lite</span>
        </div>

        <p className="uppercase text-xs tracking-[0.2em] text-muted-foreground font-medium mb-3">
          Create account
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tight mb-2">
          Start tracking today
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          Takes 30 seconds. No credit card required.
        </p>

        <form onSubmit={onSubmit} className="space-y-5" data-testid="register-form">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Name
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={onChange("name")}
              required
              placeholder="Jane Doe"
              className="h-11 bg-background"
              data-testid="register-name-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={onChange("email")}
              required
              placeholder="you@example.com"
              className="h-11 bg-background"
              data-testid="register-email-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={onChange("password")}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="h-11 bg-background"
              data-testid="register-password-input"
            />
          </div>

          {error && (
            <div
              className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2"
              data-testid="register-error"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 bg-primary hover:bg-primary/90 font-medium group"
            data-testid="register-submit-button"
          >
            {submitting ? "Creating…" : (
              <span className="inline-flex items-center gap-2">
                Create account
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium" data-testid="goto-login-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
