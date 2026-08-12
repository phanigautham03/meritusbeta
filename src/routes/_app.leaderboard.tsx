import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trophy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLeaderboard } from "@/lib/data.functions";
import { useAuth } from "@/integrations/external-supabase/auth-context";
import { toast } from "sonner";
import { FeatureHowTo } from "@/components/meritus/FeatureHowTo";

export const Route = createFileRoute("/_app/leaderboard")({
  component: Leaderboard,
  head: () => ({ meta: [{ title: "Leaderboard — Meritus" }] }),
});

function shareRank(rank: number | string, points: number, firstName: string) {
  const text = `🏆 I'm ranked #${rank} on Meritus with ${points} merit points!\n\nMeritus is India's AI-powered exam prep platform — Forget-Meter, NTA simulator, ExamMatch AI, and more.\n\n👉 Join me: https://meritus.co.in`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(waUrl, "_blank", "noopener,noreferrer");
  toast.success("Opening WhatsApp to share your rank!");
}

function Leaderboard() {
  const { user } = useAuth();
  const fetchFn = useServerFn(getLeaderboard);
  const { data, isLoading, error } = useQuery({ queryKey: ["leaderboard"], queryFn: () => fetchFn() });

  // Find current user's row
  const myRow = (data ?? []).find((row: any) => row.user_id === user?.id || row.id === user?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FeatureHowTo
        title="Leaderboard & Rank"
        steps={[
          { step: "Earn merit points by taking mock tests", detail: "Every correct answer earns 10 merit points. The more tests you take, the higher you climb." },
          { step: "Build your streak to stay visible", detail: "Students with active streaks are sorted higher among equal-point ties. Consistency beats cramming." },
          { step: "Share your rank on WhatsApp", detail: "Use the Share button to challenge friends. Accountability groups are the fastest way to climb." },
          { step: "Use rank to calibrate your preparation", detail: "Your Meritus rank among peers is a proxy for your actual exam rank percentile. If you're top 10% here, aim to stay there." },
        ]}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gold-light text-gold flex items-center justify-center">
            <Trophy />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-body">Leaderboard</h1>
            <p className="text-sm text-secondary-text">Top 50 students by merit points.</p>
          </div>
        </div>

        {/* Share my rank CTA */}
        {myRow && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0 border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => shareRank(myRow.rank, myRow.merit_points, myRow.first_name)}
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Share my rank</span>
            <span className="sm:hidden">Share</span>
          </Button>
        )}
      </div>

      {/* My rank card (sticky highlight if found) */}
      {myRow && (
        <div className="bg-gradient-to-r from-primary to-violet-600 text-white rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-black">#{myRow.rank}</div>
            <div>
              <div className="font-semibold">You</div>
              <div className="text-xs text-indigo-200">{myRow.city ?? "—"} · 🔥 {myRow.current_streak} day streak</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{myRow.merit_points}</div>
            <div className="text-xs text-indigo-200">merit points</div>
          </div>
        </div>
      )}

      {isLoading && <div className="text-secondary-text"><Loader2 className="animate-spin inline mr-2" size={16} /> Loading…</div>}
      {error && <div className="text-danger text-sm">Failed: {(error as Error).message}</div>}
      {!isLoading && (data?.length ?? 0) === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-secondary-text">
          No rankings yet — be the first to score merit points!
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs font-bold text-secondary-text border-b border-border bg-muted/30">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Student</div>
          <div className="col-span-3">City</div>
          <div className="col-span-2 text-right">Streak</div>
          <div className="col-span-1 text-right">Pts</div>
          <div className="col-span-1" />
        </div>
        <div className="divide-y divide-border">
          {(data ?? []).map((row: any) => {
            const isMe = row.user_id === user?.id || row.id === user?.id;
            return (
              <div
                key={row.user_id ?? row.id}
                className={cn(
                  "grid grid-cols-12 gap-2 px-5 py-3 items-center text-sm",
                  isMe && "bg-primary/5 border-l-2 border-primary"
                )}
              >
                <div className={cn("col-span-1 font-bold", row.rank <= 3 ? "text-gold" : "text-secondary-text")}>#{row.rank}</div>
                <div className="col-span-4 font-medium text-body flex items-center gap-1.5">
                  {row.first_name}
                  {isMe && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">YOU</span>}
                </div>
                <div className="col-span-3 text-secondary-text text-xs">{row.city ?? "—"}</div>
                <div className="col-span-2 text-right text-orange-600">🔥 {row.current_streak}</div>
                <div className="col-span-1 text-right font-bold text-primary">{row.merit_points}</div>
                <div className="col-span-1 flex justify-end">
                  {isMe && (
                    <button
                      onClick={() => shareRank(row.rank, row.merit_points, row.first_name)}
                      className="p-1 rounded hover:bg-primary/10 text-secondary-text hover:text-primary transition-colors"
                      title="Share on WhatsApp"
                    >
                      <Share2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite friends */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-green-800 text-sm">Challenge your friends 🏆</div>
          <div className="text-green-600 text-xs mt-1">Invite friends to Meritus and compete for the top rank together.</div>
        </div>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white gap-2 shrink-0"
          onClick={() => {
            const text = `📚 I'm using Meritus to prepare smarter for my exams! AI-powered mock tests, Forget-Meter & more.\n\nJoin me: https://meritus.co.in`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
          }}
        >
          <Share2 size={14} /> Invite on WhatsApp
        </Button>
      </div>
    </div>
  );
}
