import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { isAdmin, listSubjects, generateAIQuestions } from "@/lib/tests.functions";

export const Route = createFileRoute("/_app/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Meritus" }] }),
});

function AdminPage() {
  const checkAdmin = useServerFn(isAdmin);
  const fetchSubjects = useServerFn(listSubjects);
  const generate = useServerFn(generateAIQuestions);
  const qc = useQueryClient();

  const adminQ = useQuery({ queryKey: ["isAdmin"], queryFn: () => checkAdmin() });
  const subjectsQ = useQuery({ queryKey: ["subjects"], queryFn: () => fetchSubjects() });

  const [subject, setSubject] = useState<string>("");
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);

  if (adminQ.isLoading) return <div className="p-8 text-secondary-text"><Loader2 className="animate-spin inline mr-2" size={16} /> Checking access…</div>;
  if (!adminQ.data?.admin) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <ShieldCheck className="mx-auto mb-3 text-secondary-text" />
        <h1 className="text-xl font-bold text-body">Admin only</h1>
        <p className="mt-1 text-sm text-secondary-text">This page is restricted. The first signup on the platform was given the admin role.</p>
      </div>
    );
  }

  async function run() {
    if (!subject) return toast.error("Pick a subject");
    setBusy(true);
    try {
      const r = await generate({ data: { subjectSlug: subject, count } });
      toast.success(`Added ${r.added} ${r.subject} questions`);
      qc.invalidateQueries({ queryKey: ["tests"] });
    } catch (e: any) {
      toast.error(e.message ?? "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-body">Admin · AI Question Generator</h1>
        <p className="text-sm text-secondary-text mt-1">
          Generate fresh NEET PG MCQs via Lovable AI (Gemini 2.5 Flash). Questions are auto-approved and immediately available to students.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
        <div>
          <label className="text-sm font-medium text-body">Subject</label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Pick a subject" /></SelectTrigger>
            <SelectContent>
              {(subjectsQ.data ?? []).map((s) => (
                <SelectItem key={s.id} value={s.slug}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-body">Count (1–10)</label>
          <input
            type="number" min={1} max={10} value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
            className="mt-1.5 h-11 w-full rounded-md border border-border px-3 bg-card"
          />
        </div>
        <Button onClick={run} disabled={busy} className="w-full h-11 font-semibold">
          {busy ? <><Loader2 className="animate-spin mr-2" size={16} /> Generating…</> : <><Sparkles className="mr-2" size={16} /> Generate questions</>}
        </Button>
      </div>

      <p className="text-xs text-secondary-text">
        Tip: new questions land in the global pool. To add them to existing tests, link them via test_questions or create a new test.
      </p>
    </div>
  );
}