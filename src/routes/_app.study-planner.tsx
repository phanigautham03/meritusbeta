import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateStudyPlan } from "@/lib/data.functions";

export const Route = createFileRoute("/_app/study-planner")({
  component: StudyPlanner,
  head: () => ({ meta: [{ title: "Study Planner — Meritus" }] }),
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function StudyPlanner() {
  const generate = useServerFn(generateStudyPlan);
  const [examDate, setExamDate] = useState("");
  const [hours, setHours] = useState(6);
  const [exams, setExams] = useState("JEE Main");
  const [weak, setWeak] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<Record<string, any[]>>({});

  async function run() {
    if (!examDate || !exams.trim()) return toast.error("Enter exam date and at least one exam");
    setBusy(true);
    try {
      const r = await generate({ data: {
        examDate, availableHours: hours,
        selectedExams: exams.split(",").map(s=>s.trim()).filter(Boolean),
        weakTopics: weak ? weak.split(",").map(s=>s.trim()).filter(Boolean) : undefined,
      }});
      setPlan(r.weekly_plan ?? {});
      toast.success("Plan ready!");
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-body">AI Study Planner</h1>
        <p className="text-sm text-secondary-text mt-1">Get a personalised 7-day plan generated from your inputs.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-card grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <div><Label>Exam date</Label><Input type="date" value={examDate} onChange={(e)=>setExamDate(e.target.value)} className="mt-1.5 h-11"/></div>
        <div><Label>Hours/day</Label><Input type="number" min={1} max={16} value={hours} onChange={(e)=>setHours(Math.max(1,Math.min(16,Number(e.target.value)||1)))} className="mt-1.5 h-11"/></div>
        <div><Label>Exams (comma-separated)</Label><Input value={exams} onChange={(e)=>setExams(e.target.value)} className="mt-1.5 h-11"/></div>
        <div><Label>Weak topics (optional)</Label><Input value={weak} onChange={(e)=>setWeak(e.target.value)} placeholder="Rotational Motion, Probability" className="mt-1.5 h-11"/></div>
        <div className="sm:col-span-2 lg:col-span-4">
          <Button onClick={run} disabled={busy} className="font-semibold">
            {busy ? <><Loader2 className="animate-spin mr-2" size={16}/> Generating…</> : <><Sparkles className="mr-2" size={16}/> Generate weekly plan</>}
          </Button>
        </div>
      </div>

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
