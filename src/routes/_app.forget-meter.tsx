import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Loader2, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { listMyRevisions, listAllTopics, reviseTopic } from "@/lib/data.functions";

export const Route = createFileRoute("/_app/forget-meter")({
  component: ForgetMeter,
  head: () => ({ meta: [{ title: "Forget Meter — Meritus" }] }),
});

function ForgetMeter() {
  const qc = useQueryClient();
  const fetchRev = useServerFn(listMyRevisions);
  const fetchAll = useServerFn(listAllTopics);
  const reviseFn = useServerFn(reviseTopic);

  const revQ = useQuery({ queryKey: ["my-revisions"], queryFn: () => fetchRev() });
  const allQ = useQuery({ queryKey: ["all-topics"], queryFn: () => fetchAll() });

  async function track(topicId: string) {
    try { await reviseFn({ data: { topicId } }); toast.success("Marked revised — retention reset to 100%"); qc.invalidateQueries({ queryKey: ["my-revisions"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-body">Forget Meter</h1>
        <p className="text-sm text-secondary-text mt-1">Spaced-repetition retention scores across your tracked topics.</p>
      </div>

      <section className="bg-card border border-border rounded-xl p-5 shadow-card">
        <h2 className="font-semibold text-body">Tracked topics</h2>
        {revQ.isLoading && <div className="text-secondary-text mt-3"><Loader2 className="animate-spin inline mr-2" size={14}/> Loading…</div>}
        {!revQ.isLoading && (revQ.data?.length ?? 0) === 0 && (
          <div className="mt-3 text-sm text-secondary-text">No topics tracked yet. Pick from the catalog below to start.</div>
        )}
        <div className="mt-4 space-y-3">
          {(revQ.data ?? []).map((r: any) => {
            const score = r.retention_score;
            const tone = score >= 70 ? "bg-success" : score >= 40 ? "bg-gold" : "bg-danger";
            return (
              <div key={r.id} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-body text-sm">{r.topic?.topic_name}</div>
                  <div className="text-xs text-secondary-text">{r.topic?.subject} · {r.topic?.exam_name} · revised {r.times_revised}×</div>
                </div>
                <div className="hidden sm:block w-48">
                  <div className="h-2 rounded-full bg-border overflow-hidden"><div className={cn("h-full rounded-full", tone)} style={{ width: `${score}%` }} /></div>
                </div>
                <span className="text-sm font-bold w-12 text-right">{score}%</span>
                <Button size="sm" onClick={() => track(r.topic.id)}>Revise Now</Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-2"><Brain size={18} className="text-primary" /><h2 className="font-semibold text-body">Topic catalog</h2></div>
        {allQ.isLoading ? <Loader2 className="animate-spin inline mr-2 mt-3" size={14}/> : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[480px] overflow-y-auto">
            {(allQ.data ?? []).map((t: any) => (
              <button key={t.id} onClick={() => track(t.id)} className="text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary-light/40 transition-all">
                <div className="text-xs text-secondary-text">{t.exam_name} · {t.subject}</div>
                <div className="text-sm font-medium text-body line-clamp-1">{t.topic_name}</div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
