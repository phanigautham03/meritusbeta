import { useState, useRef, useEffect, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, BookOpen, FileText, CalendarDays, Brain, Sparkles,
  Trophy, Users, ChevronLeft, ChevronRight, Bell, Search, LogOut,
  Settings as SettingsIcon, User, Crown, Home, BarChart3, HelpCircle,
  ClipboardList, ExternalLink, X, ShieldCheck, MessageSquarePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/integrations/external-supabase/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeritusLogo, MeritusIcon } from "@/components/meritus/MeritusLogo";
import { isAdminEmail } from "@/lib/admin-config";
import { getEffectivePlan } from "@/lib/beta-config";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-exams", label: "My Exams", icon: BookOpen },
  { to: "/mock-tests", label: "Mock Tests", icon: FileText },
  { to: "/study-planner", label: "Study Planner", icon: CalendarDays },
  { to: "/forget-meter", label: "Forget-Meter", icon: Brain, badge: "AI", badgeColor: "bg-teal text-white" },
  { to: "/ai-tutor", label: "AI Tutor", icon: Sparkles, badge: "AI", badgeColor: "bg-primary text-white" },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/study-groups", label: "Study Groups", icon: Users, badge: "NEW", badgeColor: "bg-green-600 text-white" },
  { to: "/mentor-sessions", label: "Mentors", icon: Users },
  { to: "/feedback", label: "Give Feedback", icon: MessageSquarePlus },
  { to: "/contact", label: "Contact Support", icon: HelpCircle },
];

const mobileTabs = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/mock-tests", label: "Tests", icon: FileText },
  { to: "/forget-meter", label: "Memory", icon: Brain },
  { to: "/leaderboard", label: "Ranks", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

// Searchable items — includes all nav + extra actions
const searchIndex = [
  { label: "Dashboard", to: "/dashboard", keywords: "home overview stats" },
  { label: "My Exams", to: "/my-exams", keywords: "exams jee neet upsc enrolled" },
  { label: "Mock Tests", to: "/mock-tests", keywords: "test practice exam nta simulator quiz question mcq" },
  { label: "Study Planner", to: "/study-planner", keywords: "plan schedule timetable weekly" },
  { label: "Forget-Meter", to: "/forget-meter", keywords: "memory retention revision ebbinghaus forget" },
  { label: "AI Tutor", to: "/ai-tutor", keywords: "ai tutor chat help doubt" },
  { label: "Leaderboard", to: "/leaderboard", keywords: "rank ranking merit points top" },
  { label: "Mentor Sessions", to: "/mentor-sessions", keywords: "mentor topper 1-on-1 session" },
  { label: "Study Groups", to: "/study-groups", keywords: "group study friends whatsapp telegram invite" },
  { label: "Upgrade to Pro", to: "/upgrade", keywords: "pro power plan pricing upgrade" },
  { label: "Profile & Settings", to: "/profile", keywords: "profile settings account name" },
  { label: "Give Feedback", to: "/feedback", keywords: "feedback rate bug feature request wishlist" },
  { label: "Contact Support", to: "/contact", keywords: "contact support help email bug report hello" },
];

// Feature guide links — shown in sidebar help section
const featureGuides = [
  { label: "How Forget-Meter works", to: "/forget-meter", emoji: "🧠" },
  { label: "Take your first Mock Test", to: "/mock-tests", emoji: "📝" },
  { label: "Try the AI Tutor", to: "/ai-tutor", emoji: "✨" },
  { label: "Set up Study Planner", to: "/study-planner", emoji: "📅" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile-plan", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("plan").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const effectivePlan = getEffectivePlan(profile?.plan, user?.email);
  const planLabel = isAdminEmail(user?.email)
    ? "Admin · Power"
    : effectivePlan === "power" ? "Power plan"
    : effectivePlan === "pro"   ? "Pro plan"
    : "Free plan";

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
          <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
            {collapsed
              ? <MeritusIcon size={32} />
              : (
                <MeritusLogo size="sm" theme="dark" />
              )
            }
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
          {/* Home / Landing page link */}
          <Link
            to="/"
            className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-200 hover:bg-white/10 hover:text-white transition-colors"
            title="Go to landing page"
          >
            <Home size={18} className="shrink-0" />
            {!collapsed && <span className="flex-1 truncate">Home</span>}
          </Link>

          <div className={cn("border-t border-white/10 my-1.5", collapsed && "mx-2")} />

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

          {/* Admin link — only visible to authorised admin emails */}
          {isAdminEmail(user?.email) && (
            <>
              <div className={cn("border-t border-white/10 my-1.5", collapsed && "mx-2")} />
              <Link
                to="/admin"
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  path.startsWith("/admin")
                    ? "bg-white/15 text-white before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-white before:rounded-r"
                    : "text-amber-300 hover:bg-white/10 hover:text-amber-200",
                )}
                title="Admin Dashboard"
              >
                <ShieldCheck size={18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">Admin</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                      ADMIN
                    </span>
                  </>
                )}
              </Link>
            </>
          )}
        </nav>

        {/* Help / Feature Guides */}
        <div className="px-2 py-2 border-t border-white/10">
          {!collapsed && (
            <button
              onClick={() => setShowGuides((g) => !g)}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-indigo-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <HelpCircle size={15} className="shrink-0" />
              <span className="flex-1 text-left font-medium">How to use features</span>
              <ChevronRight size={12} className={cn("transition-transform", showGuides && "rotate-90")} />
            </button>
          )}
          {!collapsed && showGuides && (
            <div className="mt-1 space-y-0.5 pl-2">
              {featureGuides.map((g) => (
                <Link
                  key={g.to}
                  to={g.to}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-indigo-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span className="text-sm">{g.emoji}</span>
                  <span className="truncate">{g.label}</span>
                  <ExternalLink size={10} className="shrink-0 opacity-50" />
                </Link>
              ))}
            </div>
          )}
          {collapsed && (
            <button className="w-full flex justify-center p-2 rounded-lg text-indigo-300 hover:bg-white/10 hover:text-white" title="Feature guides">
              <HelpCircle size={16} />
            </button>
          )}
        </div>

        <div className="p-3 border-t border-white/10 space-y-2">
          {!collapsed && effectivePlan === "free" && (
            <Link
              to="/upgrade"
              className="block rounded-lg p-3 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-colors"
            >
              <div className="flex items-center gap-2 font-semibold text-sm text-white">
                <Crown size={14} className="shrink-0" />
                <span>Upgrade to Pro</span>
              </div>
              <p className="text-xs text-amber-100 mt-1">Unlock unlimited tests &amp; AI features</p>
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
                <p className="text-xs text-indigo-200">{planLabel}</p>
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
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length > 0
    ? searchIndex.filter((item) =>
        (item.label + " " + item.keywords)
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : [];

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleSelect(to: string) {
    setQuery("");
    setOpen(false);
    nav({ to: to as any });
  }

  async function handleSignOut() {
    await signOut();
    nav({ to: "/login" });
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-border flex items-center px-4 md:px-6 gap-4">
      <Link to="/dashboard" className="md:hidden flex items-center">
        <MeritusLogo size="sm" theme="light" />
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-xl mx-auto hidden sm:block relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={16} />
          <Input
            ref={inputRef}
            placeholder="Search topics, tests, mentors… (type to navigate)"
            className="pl-9 pr-8 bg-[#F9FAFB] border-border h-10 rounded-lg"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => query && setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setQuery(""); setOpen(false); }
              if (e.key === "Enter" && results.length > 0) handleSelect(results[0].to);
            }}
          />
          {query && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-body"
              onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {open && results.length > 0 && (
          <div
            ref={dropRef}
            className="absolute top-full mt-1 left-0 right-0 bg-white border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden"
          >
            {results.map((item) => (
              <button
                key={item.to}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-body hover:bg-primary-light hover:text-primary text-left transition-colors"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(item.to); }}
              >
                <Search size={13} className="text-muted-text shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
        )}
        {open && query.trim().length > 0 && results.length === 0 && (
          <div ref={dropRef} className="absolute top-full mt-1 left-0 right-0 bg-white border border-border rounded-xl shadow-lg z-50 py-3 text-center">
            <p className="text-sm text-secondary-text">No results for "<strong>{query}</strong>"</p>
          </div>
        )}
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
