import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, BookOpen, FileText, CalendarDays, Brain, Sparkles,
  Trophy, Users, ChevronLeft, ChevronRight, Bell, Search, LogOut,
  Settings as SettingsIcon, User, Crown, Home, BarChart3, ShieldCheck,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/integrations/external-supabase/auth-context";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-exams", label: "My Exams", icon: BookOpen },
  { to: "/mock-tests", label: "Mock Tests", icon: FileText },
  { to: "/quiz", label: "Quiz", icon: ClipboardList, badge: "NEW", badgeColor: "bg-teal text-white" },
  { to: "/study-planner", label: "Study Planner", icon: CalendarDays },
  { to: "/forget-meter", label: "Forget-Meter", icon: Brain, badge: "NEW", badgeColor: "bg-teal text-white" },
  { to: "/ai-tutor", label: "AI Tutor", icon: Sparkles, badge: "AI", badgeColor: "bg-primary text-white" },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/mentor-sessions", label: "Mentors", icon: Users },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
];

const mobileTabs = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/mock-tests", label: "Tests", icon: FileText },
  { to: "/forget-meter", label: "Memory", icon: Brain },
  { to: "/leaderboard", label: "Ranks", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Student";
  const firstName = fullName.split(" ")[0];
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-navy text-white sticky top-0 h-screen transition-[width] duration-200",
          collapsed ? "w-[72px]" : "w-[240px]",
        )}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center font-bold text-white">M</div>
            {!collapsed && <span className="font-bold text-lg">Meritus</span>}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 rounded hover:bg-white/10 text-indigo-200"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/15 text-white before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-white before:rounded-r"
                    : "text-indigo-200 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", item.badgeColor)}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-2">
          {!collapsed && (
            <Link
              to="/upgrade"
              className="block rounded-lg p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white"
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Crown size={16} /> Upgrade to Pro
              </div>
              <p className="text-xs text-amber-50/90 mt-1">Unlock unlimited tests</p>
            </Link>
          )}
          <Link
            to="/profile"
            className={cn(
              "flex items-center gap-2 rounded-lg p-2 hover:bg-white/10",
              collapsed && "justify-center",
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{firstName}</p>
                <p className="text-xs text-indigo-200">Free plan</p>
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar firstName={firstName} initials={initials} />
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-6">{children}</main>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-40">
        <div className="grid grid-cols-5">
          {mobileTabs.map((t) => {
            const Icon = t.icon;
            const active = path.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex flex-col items-center justify-center py-2 gap-0.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-secondary-text",
                )}
              >
                <span className={cn("p-1.5 rounded-full", active && "bg-primary-light")}>
                  <Icon size={18} />
                </span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function TopNavbar({ firstName, initials }: { firstName: string; initials: string }) {
  const { signOut } = useAuth();
  const nav = useNavigate();
  async function handleSignOut() {
    await signOut();
    nav({ to: "/login" });
  }
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-border flex items-center px-4 md:px-6 gap-4">
      <Link to="/dashboard" className="md:hidden flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center font-bold text-white">M</div>
        <span className="font-bold">Meritus</span>
      </Link>
      <div className="flex-1 max-w-xl mx-auto hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={16} />
          <Input
            placeholder="Search topics, tests, mentors..."
            className="pl-9 bg-[#F9FAFB] border-border h-10 rounded-lg"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <div className="hidden sm:flex items-center text-xs font-semibold rounded-md border border-border overflow-hidden">
          <button className="px-2 py-1 bg-primary text-white">EN</button>
          <button className="px-2 py-1 text-secondary-text hover:bg-muted">HI</button>
        </div>
        <button className="relative p-2 rounded-lg hover:bg-muted text-secondary-text">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium">{firstName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem asChild><Link to="/profile"><User size={14} className="mr-2" />Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/upgrade"><Crown size={14} className="mr-2" />Upgrade Plan</Link></DropdownMenuItem>
            <DropdownMenuItem><SettingsIcon size={14} className="mr-2" />Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-danger">
              <LogOut size={14} className="mr-2" />Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
