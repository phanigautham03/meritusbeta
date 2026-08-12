import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { sendWelcomeEmail, sendLoginEmail } from "@/lib/email.functions";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Helper: extract first name from user metadata ─────────────────────────────
function getFirstName(user: User | null): string {
  if (!user) return "there";
  const full =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "there";
  return full.split(" ")[0];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Track already-emailed sessions so we don't re-fire on tab focus
  const [emailedSession, setEmailedSession] = useState<string | null>(null);

  const sendWelcome = useServerFn(sendWelcomeEmail);
  const sendLogin   = useServerFn(sendLoginEmail);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);

      // Send emails on new sign-in events (not on token refresh / page reload)
      if (s && (event === "SIGNED_IN") && s.access_token !== emailedSession) {
        setEmailedSession(s.access_token);
        const email = s.user.email ?? "";
        const firstName = getFirstName(s.user);

        // New user (just signed up): welcome email
        // Returning user: login notification email
        const isNew = event === "SIGNED_IN" &&
          s.user.created_at &&
          Date.now() - new Date(s.user.created_at).getTime() < 60_000; // within last 60s

        if (isNew) {
          sendWelcome({ data: { email, firstName } }).catch(console.warn);
        } else {
          sendLogin({ data: { email, firstName } }).catch(console.warn);
        }
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,

    signInWithPassword: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },

    signUpWithPassword: async (email, password, metadata) => {
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata, emailRedirectTo: redirectTo },
      });
      return { error: error?.message ?? null };
    },

    signInWithGoogle: async () => {
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      return { error: error?.message ?? null };
    },

    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
