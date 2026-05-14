import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { externalSupabase } from "./client";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set listener BEFORE getSession (per Supabase guidance).
    const { data: sub } = externalSupabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    externalSupabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    signInWithPassword: async (email, password) => {
      const { error } = await externalSupabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    signUpWithPassword: async (email, password, metadata) => {
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/onboarding` : undefined;
      const { error } = await externalSupabase.auth.signUp({
        email,
        password,
        options: { data: metadata, emailRedirectTo: redirectTo },
      });
      return { error: error?.message ?? null };
    },
    signInWithGoogle: async () => {
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
      const { error } = await externalSupabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      return { error: error?.message ?? null };
    },
    signOut: async () => {
      await externalSupabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
