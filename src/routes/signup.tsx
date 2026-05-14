import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthSplit } from "@/components/meritus/AuthSplit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/integrations/external-supabase/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const { signUpWithPassword, signInWithGoogle, user } = useAuth();

  useEffect(() => {
    if (user) nav({ to: "/onboarding" });
  }, [user, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await signUpWithPassword(email, password, { full_name: name });
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Check your email to confirm your account.");
    nav({ to: "/onboarding" });
  }

  async function onGoogle() {
    setBusy(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error);
      setBusy(false);
    }
  }

  return (
    <AuthSplit
      title="Join 3.8 crore aspirants"
      subtitle="Start your merit journey free. Upgrade when ready."
      bullets={["Free forever plan with 3 mock tests/month", "AI-powered weak-spot detection", "Access to 200+ Indian exams"]}
    >
      <h2 className="text-2xl font-bold text-body">Create your account</h2>
      <p className="text-sm text-secondary-text mt-1">Get started in under a minute.</p>

      <Button type="button" variant="outline" disabled={busy} onClick={onGoogle} className="w-full mt-6 h-11 border-border">
        <svg className="mr-2" width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c4.9 0 9.4-1.9 12.8-5l-5.9-5c-2 1.5-4.4 2.4-6.9 2.4-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.4 4.3-4.4 5.6l5.9 5C40.6 35.7 43.5 30.3 43.5 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
        Continue with Google
      </Button>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-text">
        <div className="flex-1 h-px bg-border" />
        or continue with email
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Rahul Kumar" className="mt-1.5 h-11"
            value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" className="mt-1.5 h-11"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1.5">
            <Input id="password" type={show ? "text" : "password"} className="h-11 pr-10"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <Button type="submit" disabled={busy} className="w-full h-11 font-semibold">
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-secondary-text text-center mt-5">
        Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
      </p>
      <p className="text-xs text-muted-text text-center mt-4">
        By signing up you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
      </p>
    </AuthSplit>
  );
}
