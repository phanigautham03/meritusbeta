import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { listMyExams, addMyExam, removeMyExam } from "@/lib/data.functions";

export const Route = createFileRoute("/_app/my-exams")({
  component: MyExams,
  head: () => ({ meta: [{ title: "My Exams — Meritus" }] }),
});

const POPULAR = ["JEE Main", "JEE Advanced", "NEET", "UPSC", "CAT", "GATE", "IBPS PO", "SSC CGL", "BITSAT"];

function MyExams() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyExams);
  const addFn = useServerFn(addMyExam);
  const rmFn = useServerFn(removeMyExam);

  const { data, isLoading } = useQuery({ queryKey: ["my-exams"], queryFn: () => listFn() });
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(examName: string) {
    if (!examName.trim()) return;
    setBusy(true);
    try { await addFn({ data: { examName: examName.trim(), targetDate: date || null } }); setName(""); setDate(""); toast.success(`Added ${examName}`); qc.invalidateQueries({ queryKey: ["my-exams"] }); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function rm(id: string) {
    try { await rmFn({ data: { id } }); qc.invalidateQueries({ queryKey: ["my-exams"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-body">My Exams</h1>
        <p className="text-sm text-secondary-text mt-1">Track exams you're preparing for and their target dates.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-card">
        <h2 className="font-semibold text-body">Add an exam</h2>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <Input placeholder="Exam name (e.g. JEE Main 2025)" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 sm:w-44" />
          <Button onClick={() => add(name)} disabled={busy || !name.trim()} className="h-11 font-semibold"><Plus size={16} className="mr-1"/> Add</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {POPULAR.map((e) => (
            <button key={e} onClick={() => add(e)} disabled={busy} className="text-xs px-3 py-1.5 rounded-md border border-dashed border-border hover:bg-primary-light hover:border-primary text-secondary-text">+ {e}</button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card divide-y divide-border">
        {isLoading && <div className="p-6 text-secondary-text"><Loader2 className="animate-spin inline mr-2" size={16}/> Loading…</div>}
        {!isLoading && (data?.length ?? 0) === 0 && <div className="p-8 text-center text-sm text-secondary-text">No exams added yet.</div>}
        {(data ?? []).map((e: any) => (
          <div key={e.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium text-body">{e.exam_name}</div>
              <div className="text-xs text-secondary-text">{e.target_date ? `Target: ${e.target_date}` : "No target date set"}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => rm(e.id)}><Trash2 size={16} className="text-danger" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
