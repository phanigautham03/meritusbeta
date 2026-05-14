import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/mock-tests/$id")({
  component: TestUI,
  head: () => ({
    meta: [
      { title: "Mock Test — Meritus" },
      { name: "description", content: "Take your mock test in a pixel-perfect NTA-style interface with real-time timer." },
      { property: "og:title", content: "Mock Test — Meritus" },
      { property: "og:description", content: "Take your mock test in a pixel-perfect NTA-style interface with real-time timer." },
      { property: "og:type", content: "website" },
    ],
  }),
});

const sections = ["Physics", "Chemistry", "Mathematics"];
const total = 30;

function TestUI() {
  const nav = useNavigate();
  const [section, setSection] = useState("Physics");
  const [current, setCurrent] = useState(1);
  const [answers, setAnswers] = useState<Record<number, "answered" | "marked" | "notAnswered">>({ 2: "answered", 5: "answered", 7: "marked", 10: "notAnswered" });
  const [selected, setSelected] = useState<number | null>(null);
  const [secs, setSecs] = useState(6323); // 1:45:23

  useEffect(() => {
    const i = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, []);

  const fmt = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${ss}`;
  };

  const counts = {
    answered: Object.values(answers).filter((v) => v === "answered").length,
    notAnswered: Object.values(answers).filter((v) => v === "notAnswered").length,
    marked: Object.values(answers).filter((v) => v === "marked").length,
    notVisited: total - Object.keys(answers).length,
  };

  const status = (n: number) => answers[n];
  const cls = (n: number) => {
    if (n === current) return "bg-card border-2 border-gold text-gold";
    const s = status(n);
    if (s === "answered") return "bg-success text-white";
    if (s === "notAnswered") return "bg-danger text-white";
    if (s === "marked") return "bg-violet-600 text-white";
    return "bg-muted text-secondary-text";
  };

  const save = (markReview = false) => {
    setAnswers((a) => ({ ...a, [current]: markReview ? "marked" : selected !== null ? "answered" : "notAnswered" }));
    setSelected(null);
    setCurrent((c) => Math.min(total, c + 1));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* top */}
      <header className="bg-navy text-white px-4 h-16 flex items-center justify-between gap-4 shrink-0">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center font-bold text-sm">M</div>
          <span className="font-bold hidden sm:inline">Meritus</span>
        </Link>
        <div className="hidden md:flex items-center gap-1 bg-white/10 rounded-lg p-1">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={cn("px-3 py-1.5 rounded-md text-sm font-medium", section === s ? "bg-white text-navy" : "text-indigo-100 hover:bg-white/10")}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("font-mono text-lg md:text-xl font-bold tabular-nums px-3 py-1 rounded", secs < 600 ? "text-red-400" : "text-white")}>
            {fmt(secs)}
          </div>
          <Button onClick={() => nav({ to: "/results/$id", params: { id: "1" } })} className="bg-danger hover:bg-danger/90 font-semibold">Submit Test</Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* main question */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-body">Question {current}</span>
              <span className="text-xs text-secondary-text">+4 marks correct · −1 wrong</span>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              <p className="text-base leading-relaxed text-body">
                A particle moves in a circle of radius <em>r</em> with constant angular velocity <em>ω</em>.
                The magnitude of its acceleration at any instant is:
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "ω²r directed towards the centre",
                  "ωr directed tangentially",
                  "ω²r directed away from the centre",
                  "ωr² directed towards the centre",
                ].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "w-full text-left rounded-lg border p-4 flex items-center gap-3 transition-all",
                      selected === i
                        ? "border-primary bg-primary-light shadow-[inset_3px_0_0_var(--color-primary)]"
                        : "border-border bg-card hover:border-indigo-200 hover:bg-primary-light/40 hover:shadow-[inset_3px_0_0_var(--color-primary)]",
                    )}
                  >
                    <span className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0", selected === i ? "border-primary bg-primary" : "border-border")}>
                      {selected === i && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm text-body">{String.fromCharCode(65 + i)}. {opt}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => save(true)} variant="outline" className="border-violet-500 text-violet-600 hover:bg-violet-50">Mark for Review & Next</Button>
                <Button onClick={() => setSelected(null)} variant="ghost">Clear Response</Button>
                <Button onClick={() => save(false)} className="ml-auto font-semibold">Save & Next</Button>
              </div>
            </div>
          </div>
        </main>

        {/* sidebar palette */}
        <aside className="lg:w-[300px] bg-card border-t lg:border-t-0 lg:border-l border-border p-5 overflow-y-auto">
          <h3 className="font-semibold text-body">Question Palette</h3>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {[
              ["Answered", counts.answered, "bg-success"],
              ["Not Answered", counts.notAnswered, "bg-danger"],
              ["Marked", counts.marked, "bg-violet-600"],
              ["Not Visited", counts.notVisited, "bg-muted-text"],
            ].map(([l, c, color]) => (
              <div key={l as string} className="flex items-center gap-2">
                <span className={cn("h-3 w-3 rounded", color as string)} />
                <span className="text-secondary-text">{l as string}: <b className="text-body">{c as number}</b></span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-5 gap-1.5">
            {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setCurrent(n)}
                className={cn("h-9 rounded text-xs font-bold flex items-center justify-center", cls(n))}
              >
                {n}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
