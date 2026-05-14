import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLeaderboard } from "@/lib/data.functions";

export const Route = createFileRoute("/_app/leaderboard")({
  component: Leaderboard,
  head: () => ({ meta: [{ title: "Leaderboard — Meritus" }] }),
});

function Leaderboard() {
  const fetchFn = useServerFn(getLeaderboard);
  const { data, isLoading, error } = useQuery({ queryKey: ["leaderboard"], queryFn: () => fetchFn() });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gold-light text-gold flex items-center justify-center"><Trophy /></div>
        <div>
          <h1 className="text-2xl font-bold text-body">Leaderboard</h1>
          <p className="text-sm text-secondary-text">Top 50 students by merit points.</p>
        </div>
      </div>

      {isLoading && <div className="text-secondary-text"><Loader2 className="animate-spin inline mr-2" size={16}/> Loading…</div>}
      {error && <div className="text-danger text-sm">Failed: {(error as Error).message}</div>}
      {!isLoading && (data?.length ?? 0) === 0 && <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-secondary-text">No rankings yet — be the first to score merit points!</div>}

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs font-bold text-secondary-text border-b border-border bg-muted/30">
          <div className="col-span-1">#</div><div className="col-span-5">Student</div><div className="col-span-3">City</div><div className="col-span-2 text-right">Streak</div><div className="col-span-1 text-right">Pts</div>
        </div>
        <div className="divide-y divide-border">
          {(data ?? []).map((row: any) => (
            <div key={row.user_id} className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-sm">
              <div className={cn("col-span-1 font-bold", row.rank <= 3 ? "text-gold" : "text-secondary-text")}>#{row.rank}</div>
              <div className="col-span-5 font-medium text-body">{row.first_name}</div>
              <div className="col-span-3 text-secondary-text text-xs">{row.city ?? "—"}</div>
              <div className="col-span-2 text-right text-orange-600">🔥 {row.current_streak}</div>
              <div className="col-span-1 text-right font-bold text-primary">{row.merit_points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
