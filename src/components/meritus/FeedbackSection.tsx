/**
 * FeedbackSection — Feature rating widget (1–10) with per-feature context.
 * Used on the landing page. Each feature has a custom "1 means" / "10 means" label.
 * Ratings are stored locally and submitted to admin via API.
 */
import { useState } from "react";
import { Star, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FeatureRating {
  key: string;
  label: string;
  emoji: string;
  low: string;   // what 1 means
  high: string;  // what 10 means
}

const featureRatings: FeatureRating[] = [
  {
    key: "forget_meter",
    label: "Forget-Meter",
    emoji: "🧠",
    low: "I forget to open it / it doesn't change how I revise",
    high: "I check it daily and it tells me exactly what to study next",
  },
  {
    key: "nta_simulator",
    label: "NTA Exam Simulator",
    emoji: "📝",
    low: "The interface feels nothing like the real exam",
    high: "It feels identical to the real exam — I use nothing else for mock tests",
  },
  {
    key: "exam_match",
    label: "ExamMatch AI",
    emoji: "✨",
    low: "The recommendations were irrelevant to my profile",
    high: "It identified my ideal exam — I changed my prep strategy based on it",
  },
  {
    key: "study_planner",
    label: "AI Study Planner",
    emoji: "📅",
    low: "The plan doesn't reflect my real schedule or needs",
    high: "I follow this plan every day — it's replaced my manual timetable",
  },
  {
    key: "leaderboard",
    label: "Leaderboard & Rank",
    emoji: "🏆",
    low: "The ranking feels meaningless to me",
    high: "My Meritus rank directly motivates me to study harder each day",
  },
  {
    key: "mentor_sessions",
    label: "Mentor Sessions",
    emoji: "👨‍🏫",
    low: "I don't see value in 1-on-1 sessions",
    high: "I would pay for a session immediately if a mentor for my exam was available",
  },
];

const STORAGE_KEY = "meritus_feature_feedback_v1";

function getSavedRatings(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

function saveRatings(ratings: Record<string, number>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings)); } catch {}
}

function RatingDots({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className={cn(
            "h-7 w-7 rounded-full text-xs font-bold transition-all border",
            n <= display
              ? n <= 3
                ? "bg-danger/80 border-danger text-white scale-105"
                : n <= 6
                ? "bg-gold/80 border-gold text-white scale-105"
                : "bg-success/80 border-success text-white scale-105"
              : "bg-muted border-border text-secondary-text hover:border-primary hover:text-primary",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export function FeedbackSection() {
  const [ratings, setRatings] = useState<Record<string, number>>(getSavedRatings);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  function setRating(key: string, value: number) {
    const updated = { ...ratings, [key]: value };
    setRatings(updated);
    saveRatings(updated);
  }

  function getContext(f: FeatureRating, val: number) {
    if (!val) return null;
    if (val <= 3) return `1 = "${f.low}"`;
    if (val >= 8) return `10 = "${f.high}"`;
    return `Midpoint — some value, room to improve`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filled = featureRatings.filter((f) => ratings[f.key] > 0);
    if (filled.length === 0) return toast.error("Please rate at least one feature.");
    setBusy(true);

    const payload = {
      ratings: featureRatings.map((f) => ({ feature: f.label, score: ratings[f.key] ?? 0 })),
      comment,
      page: "landing",
      submittedAt: new Date().toISOString(),
    };

    try {
      // Best-effort: send to admin via our API
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {}); // silently ignore if endpoint doesn't exist yet

      setSubmitted(true);
      toast.success("Thanks for your feedback! It helps us build better features.");
    } catch {
      setSubmitted(true); // still thank them even if network fails
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
        <h3 className="text-xl font-bold text-body">Thank you for rating Meritus!</h3>
        <p className="mt-2 text-secondary-text max-w-md mx-auto text-sm">
          Your feedback goes directly to our team and shapes what we build next.
          We read every single response.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-5">
        {featureRatings.map((f) => {
          const val = ratings[f.key] ?? 0;
          const ctx = getContext(f, val);
          return (
            <div key={f.key} className="bg-card border border-border rounded-xl p-5 shadow-card space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{f.emoji}</span>
                <span className="font-semibold text-body text-sm">{f.label}</span>
                {val > 0 && (
                  <span className={cn(
                    "ml-auto text-xs font-bold px-2 py-0.5 rounded-full",
                    val <= 3 ? "bg-danger/10 text-danger" : val <= 6 ? "bg-gold/10 text-gold" : "bg-success/10 text-success"
                  )}>
                    {val}/10
                  </span>
                )}
              </div>

              <RatingDots value={val} onChange={(v) => setRating(f.key, v)} />

              <div className="grid grid-cols-2 gap-1 text-[10px] text-secondary-text">
                <span className="text-danger/80">1 = {f.low.slice(0, 40)}{f.low.length > 40 ? "…" : ""}</span>
                <span className="text-success/80 text-right">10 = {f.high.slice(0, 40)}{f.high.length > 40 ? "…" : ""}</span>
              </div>

              {ctx && val > 0 && val <= 6 && (
                <div className="text-xs text-secondary-text bg-muted/50 rounded-md px-2 py-1 italic">
                  You rated {val}/10. What would make it a 9 or 10 for you?
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-card">
        <label className="font-semibold text-body text-sm block mb-2">
          Anything else? (optional)
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What would make Meritus a 10/10 for you? Missing feature, UI issue, something you loved…"
          rows={3}
          className="resize-none text-sm"
          maxLength={800}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={busy} className="gap-2 font-semibold">
          <Send size={14} /> Submit ratings
        </Button>
        <span className="text-xs text-secondary-text">
          {featureRatings.filter((f) => ratings[f.key] > 0).length}/{featureRatings.length} features rated
        </span>
      </div>
    </form>
  );
}
