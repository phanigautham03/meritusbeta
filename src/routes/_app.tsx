import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/meritus/AppShell";

export const Route = createFileRoute("/_app")({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
