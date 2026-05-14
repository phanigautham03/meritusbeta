import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Star, Loader2, Users } from "lucide-react";
import { listMentors } from "@/lib/data.functions";

export const Route = createFileRoute("/_app/mentor-sessions")({
  component: MentorSessions,
  head: () => ({ meta: [{ title: "Mentors — Meritus" }] }),
});

function MentorSessions() {
  const fetchMentors = useServerFn(listMentors);
  const { data, isLoading, error } = useQuery({ queryKey: ["mentors"], queryFn: () => fetchMentors() });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-body">1-on-1 Mentor Sessions</h1>
        <p className="text-sm text-secondary-text mt-1">Learn directly from toppers who cracked these exams.</p>
      </div>
      {isLoading && <div className="text-secondary-text"><Loader2 className="animate-spin inline mr-2" size={16} /> Loading…</div>}
      {error && <div className="text-danger text-sm">Failed: {(error as Error).message}</div>}
      {!isLoading && (data?.length ?? 0) === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Users className="mx-auto mb-3 text-secondary-text" />
          <p className="text-sm text-secondary-text">No mentors available yet.</p>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data ?? []).map((m: any) => (
          <div key={m.id} className="bg-card border border-border rounded-xl p-5 shadow-card hover:border-indigo-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex flex-col">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-violet-600 text-white flex items-center justify-center font-bold">{m.name.split(" ").map((s: string) => s[0]).slice(0, 2).join("")}</div>
              <div className="min-w-0">
                <div className="font-semibold text-body">{m.name}</div>
                <div className="text-xs text-secondary-text truncate">{m.institution}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-gold-light text-gold font-bold">{m.rank_achieved}</span>
              <span className="text-secondary-text">{m.exam_cleared}</span>
            </div>
            <p className="mt-3 text-sm text-secondary-text line-clamp-3">{m.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {(m.specialisation_tags ?? []).slice(0, 4).map((t: string) => (
                <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary-light text-primary">{t}</span>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-gold"><Star size={13} fill="currentColor" /> {Number(m.rating).toFixed(1)}</span>
                <span className="text-secondary-text">· {m.sessions_count} sessions</span>
              </div>
              <Button size="sm" className="font-semibold">Book · ₹{m.price_per_session}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
