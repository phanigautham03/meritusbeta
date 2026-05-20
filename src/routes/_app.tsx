import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/meritus/AppShell";
import { useAuth } from "@/integrations/external-supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["onboarding-status", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (user && profile && profile.onboarding_complete === false) {
      nav({ to: "/onboarding" });
    }
  }, [user, profile, nav]);

  if (loading || !user || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-4 border-primary-light border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
