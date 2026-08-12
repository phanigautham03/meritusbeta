import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { listMyRevisions, listAllTopics, reviseTopic, seedStarterTopics } from "@/lib/data.functions";
import { FeatureHowTo } from "@/components/meritus/FeatureHowTo";

export const Route = createFileRoute("/_app/forget-meter")({
  component: ForgetMeter,
  head: () => ({ meta: [{ title: "Forget Meter — Meritus" }] }),
});

function ForgetMeter() {
  const qc = useQueryClient();
  const fetchRev = useServerFn(listMyRevisions);
  const fetchAll = useServerFn(listAllTopics);
  const reviseFn = useServerFn(reviseTopic);
  const seedFn = useServerFn(seedStarterTopics);

  const revQ = useQuery({ queryKey: ["my-revisions"], queryFn: () => fetchRev() });
  const allQ = useQuery({ queryKey: ["all-topics"], queryFn: () => fetchAll() });

  // Auto-seed 10 starter topics when a new user has zero revisions
  useEffect(() => {
    if (!revQ.isLoading && (revQ.data?.length ?? 0) === 0) {
      seedFn().then((r) => {
        if ((r as any)?.seeded > 0) {
          qc.invalidateQueries({ queryKey: ["my-revisions"] });
          toast.success("We've pre-loaded your Forget-Meter with starter topics!", { duration: 4000 });
        }
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revQ.isLoading, revQ.data?.length]);

  async function track(topicId: string) {
    try {
      await reviseFn({ data: { topicId } });
      toast.success("Marked revised — retention reset to 100%");
      qc.invalidateQueries({ queryKey: ["my-revisions"] });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <FeatureHowTo
        title="Forget-Meter"
        steps={[
          { step: "Take any mock test", detail: "After you submit a test, the topics you answered are automatically logged here with a starting retention score of 100%." },
          { step: "Watch retention decay over time", detail: "The Ebbinghaus forgetting curve reduces each topic's score daily. The faster a topic decays, the more your brain is forgetting it." },
          { step: "Revise topics in the red zone", detail: "Topics below 40% are flagged in red — those are the ones you're likely to get wrong on exam day. Click 'Revise Now' to reset the score to 100%." },
          { step: "Add topics manually from the catalog", detail: "Haven't covered a topic in a test yet? Add it directly from the Topic Catalog below so it gets tracked too." },
        ]}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-body">Forget Meter</h1>
          <p className="text-sm text-secondary-text mt-1">
            Spaced-repetition retention scores across your tracked topics. Topics in red need urgent revision.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-secondary-text shrink-0 pt-1">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success inline-block"/> ≥70%</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gold inline-block"/> 40–70%</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger inline-block"/> &lt;40% — Revise now</span>
        </div>
      </div>

      <section className="bg-card border border-border rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-primary" />
          <h2 className="font-semibold text-body">Your tracked topics</h2>
          {revQ.isLoading && <Loader2 className="animate-spin ml-1" size={14} />}
        </div>

        {!revQ.isLoading && (revQ.data?.length ?? 0) === 0 && (
          <div className="mt-3 text-sm text-secondary-text flex items-center gap-2">
            <Loader2 className="animate-spin" size={14} />
            Setting up your personalised Forget-Meter…
          </div>
        )}

        <div className="mt-2 space-y-3">
          {(revQ.data ?? []).map((r: any) => {
            const score = r.retention_score;
            const tone = score >= 70 ? "bg-success" : score >= 40 ? "bg-gold" : "bg-danger";
            const urgency = score < 40 ? "border-danger/30 bg-danger/5" : "";
            return (
              <div key={r.id} className={cn("flex items-center gap-4 p-3 rounded-lg border border-border transition-colors", urgency)}>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-body text-sm">{r.topic?.topic_name}</div>
                  <div className="text-xs text-secondary-text">
                    {r.topic?.subject} · {r.topic?.exam_name}
                    {r.times_revised > 0 && <> · revised {r.times_revised}×</>}
                  </div>
                </div>
                <div className="hidden sm:block w-48">
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${score}%` }} />
                  </div>
                </div>
                <span className={cn("text-sm font-bold w-12 text-right", score < 40 ? "text-danger" : score < 70 ? "text-gold" : "text-success")}>
                  {score}%
                </span>
                <Button size="sm" variant={score < 40 ? "default" : "outline"} onClick={() => track(r.topic.id)}>
                  Revise Now
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={18} className="text-primary" />
          <h2 className="font-semibold text-body">Topic catalog</h2>
          <span className="text-xs text-secondary-text ml-1">— click any topic to start tracking it</span>
        </div>
        {allQ.isLoading
          ? <Loader2 className="animate-spin inline mr-2 mt-3" size={14} />
          : (
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[480px] overflow-y-auto">
              {(allQ.data ?? []).map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => track(t.id)}
                  className="text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary-light/40 transition-all"
                >
                  <div className="text-xs text-secondary-text">{t.exam_name} · {t.subject}</div>
                  <div className="text-sm font-medium text-body line-clamp-1">{t.topic_name}</div>
                </button>
              ))}
            </div>
          )
        }
      </section>
    </div>
  );
}
