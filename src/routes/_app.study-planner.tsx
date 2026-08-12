import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { generateStudyPlan } from "@/lib/data.functions";
import { useAuth } from "@/integrations/external-supabase/auth-context";
import { FeatureHowTo } from "@/components/meritus/FeatureHowTo";

export const Route = createFileRoute("/_app/study-planner")({
  component: StudyPlanner,
  head: () => ({ meta: [{ title: "Study Planner — Meritus" }] }),
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FREE_MONTHLY_LIMIT = 2;

function getUsageKey(userId: string) {
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  return `meritus_sp_usage_${userId}_${month}`;
}

function getUsageCount(userId: string): number {
  try { return parseInt(localStorage.getItem(getUsageKey(userId)) ?? "0", 10); } catch { return 0; }
}

function incrementUsage(userId: string) {
  try { localStorage.setItem(getUsageKey(userId), String(getUsageCount(userId) + 1)); } catch {}
}

function StudyPlanner() {
  const { user } = useAuth();
  const generate = useServerFn(generateStudyPlan);
  const [examDate, setExamDate] = useState("");
  const [hours, setHours] = useState(6);
  const [exams, setExams] = useState("JEE Main");
  const [weak, setWeak] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<Record<string, any[]>>({});

  const isPro = ["pro", "power"].includes((user as any)?.user_metadata?.plan ?? "free");
  const usageCount = user ? getUsageCount(user.id) : 0;
  const limitReached = !isPro && usageCount >= FREE_MONTHLY_LIMIT;

  async function run() {
    if (!examDate || !exams.trim()) return toast.error("Enter exam date and at least one exam");
    if (limitReached) {
      toast.error(`Free plan: ${FREE_MONTHLY_LIMIT} AI plans/month used. Upgrade to Pro for unlimited.`);
      return;
    }
    setBusy(true);
    try {
      const r = await generate({
        data: {
          examDate,
          availableHours: hours,
          selectedExams: exams.split(",").map((s) => s.trim()).filter(Boolean),
          weakTopics: weak ? weak.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        },
      });
      setPlan(r.weekly_plan ?? {});
      if (user) incrementUsage(user.id);
      toast.success("Plan ready!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <FeatureHowTo
        title="AI Study Planner"
        steps={[
          { step: "Enter your exam date and daily study hours", detail: "The AI uses your exam date to calculate how many days you have left and distributes topics accordingly." },
          { step: "List the exams you're preparing for", detail: "Separate multiple exams with commas — e.g. 'JEE Main, JEE Advanced'. The planner will balance subjects across exams." },
          { step: "Add your weak topics (optional but recommended)", detail: "Paste in topics you're struggling with — the AI prioritises these in the first half of your plan." },
          { step: "Generate and follow the 7-day plan", detail: "Each day has theory, practice, and revision blocks. Regenerate anytime your schedule changes. Free users get 2 plans/month." },
        ]}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-body">AI Study Planner</h1>
          <p className="text-sm text-secondary-text mt-1">Get a personalised 7-day plan generated from your inputs.</p>
        </div>
        {!isPro && (
          <div className="shrink-0 text-right">
            <div className="text-xs text-secondary-text">
              {usageCount}/{FREE_MONTHLY_LIMIT} free plans used this month
            </div>
            {limitReached && (
              <Link to="/upgrade">
                <Button size="sm" className="mt-1.5 gap-1.5 font-semibold">
                  <Lock size={12} /> Upgrade for unlimited
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {limitReached ? (
        <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center shadow-card">
          <div className="inline-flex h-14 w-14 rounded-full bg-primary-light items-center justify-center mb-4">
            <Lock size={24} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-body">Monthly limit reached</h2>
          <p className="mt-2 text-secondary-text max-w-md mx-auto text-sm">
            Free accounts get {FREE_MONTHLY_LIMIT} AI study plans per month. Upgrade to Pro for unlimited plans, full Forget-Meter, and more.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/upgrade">
              <Button className="font-semibold px-8">Upgrade to Pro — ₹499/mo</Button>
            </Link>
            <Link to="/mock-tests">
              <Button variant="outline">Take a mock test instead</Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-secondary-text">Your limit resets on the 1st of next month.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-5 shadow-card grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div><Label>Exam date</Label><Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="mt-1.5 h-11" /></div>
          <div><Label>Hours/day</Label><Input type="number" min={1} max={16} value={hours} onChange={(e) => setHours(Math.max(1, Math.min(16, Number(e.target.value) || 1)))} className="mt-1.5 h-11" /></div>
          <div><Label>Exams (comma-separated)</Label><Input value={exams} onChange={(e) => setExams(e.target.value)} className="mt-1.5 h-11" /></div>
          <div><Label>Weak topics (optional)</Label><Input value={weak} onChange={(e) => setWeak(e.target.value)} placeholder="Rotational Motion, Probability" className="mt-1.5 h-11" /></div>
          <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-4">
            <Button onClick={run} disabled={busy} className="font-semibold">
              {busy
                ? <><Loader2 className="animate-spin mr-2" size={16} /> Generating…</>
                : <><Sparkles className="mr-2" size={16} /> Generate weekly plan</>
              }
            </Button>
            {!isPro && (
              <span className="text-xs text-secondary-text">
                {FREE_MONTHLY_LIMIT - usageCount} plan{FREE_MONTHLY_LIMIT - usageCount !== 1 ? "s" : ""} remaining this month ·{" "}
                <Link to="/upgrade" className="text-primary hover:underline font-medium">Go Pro for unlimited</Link>
              </span>
            )}
          </div>
        </div>
      )}

      {Object.keys(plan).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {DAYS.map((d) => (
            <div key={d} className="bg-card border border-border rounded-xl p-3 shadow-card min-h-[200px]">
              <div className="font-bold text-body text-sm mb-2">{d}</div>
              <div className="space-y-2">
                {(plan[d] ?? []).map((b: any, i: number) => (
                  <div key={i} className="text-xs p-2 rounded bg-primary-light/60 border border-primary/20">
                    <div className="font-semibold text-primary">{b.time}</div>
                    <div className="text-body">{b.subject}</div>
                    <div className="text-secondary-text">{b.topic}</div>
                    <div className="text-[10px] uppercase mt-0.5 text-secondary-text">{b.kind}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
