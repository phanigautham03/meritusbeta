import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/mock-tests")({
  component: MockTests,
  head: () => ({
    meta: [
      { title: "Mock Tests — Meritus" },
      { name: "description", content: "Pixel-perfect NTA-style mock tests for JEE, NEET, GATE, CAT and more." },
      { property: "og:title", content: "Mock Tests — Meritus" },
      { property: "og:description", content: "Pixel-perfect NTA-style mock tests for JEE, NEET, GATE, CAT and more." },
      { property: "og:url", content: "https://meritusbeta.lovable.app/mock-tests" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://meritusbeta.lovable.app/mock-tests" }],
  }),
});

const tests = [
  { id: "1", exam: "JEE Main", diff: "Hard", title: "Full Mock Test #14", desc: "Complete syllabus mock as per latest NTA pattern. Tests Physics, Chemistry, Math.", q: 90, mins: 180, subject: "PCM" },
  { id: "2", exam: "NEET UG", diff: "Medium", title: "Biology Sectional", desc: "Focus on Botany — Plant Physiology, Anatomy, Reproduction in flowering plants.", q: 50, mins: 60, subject: "Biology" },
  { id: "3", exam: "UPSC CSE", diff: "Hard", title: "Prelims Practice Set 8", desc: "GS Paper 1 covering Polity, History, Geography, Economics, Environment.", q: 100, mins: 120, subject: "GS" },
  { id: "4", exam: "GATE CSE", diff: "Medium", title: "Operating Systems", desc: "Process synchronisation, deadlocks, memory management deep-dive.", q: 30, mins: 45, subject: "OS" },
  { id: "5", exam: "CAT", diff: "Easy", title: "VARC Sectional", desc: "Reading comprehension and verbal ability practice.", q: 24, mins: 40, subject: "VARC" },
  { id: "6", exam: "IBPS PO", diff: "Easy", title: "Reasoning Mock", desc: "Puzzles, syllogisms, seating arrangement practice.", q: 35, mins: 35, subject: "Reasoning" },
];

const diffColor = (d: string) =>
  d === "Easy" ? "bg-success-light text-success"
  : d === "Medium" ? "bg-gold-light text-gold"
  : "bg-danger-light text-danger";

function MockTests() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-body">Mock Tests</h1>
        <p className="text-sm text-secondary-text mt-1">Practice with NTA-pattern tests, sectional and full-length.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={16} />
            <Input placeholder="Search tests..." className="pl-9 h-11 bg-[#F9FAFB]" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="h-11"><SelectValue placeholder="Exam" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All exams</SelectItem>
              <SelectItem value="jee">JEE</SelectItem>
              <SelectItem value="neet">NEET</SelectItem>
              <SelectItem value="upsc">UPSC</SelectItem>
              <SelectItem value="gate">GATE</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="h-11"><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulty</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="med">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="mt-3 text-sm text-secondary-text">Showing 24 tests</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-5 shadow-card hover:border-indigo-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-1 rounded-md bg-primary-light text-primary">{t.exam}</span>
              <span className={cn("text-xs font-bold px-2 py-1 rounded-full", diffColor(t.diff))}>{t.diff}</span>
            </div>
            <h3 className="mt-3 font-semibold text-body">{t.title}</h3>
            <p className="mt-1.5 text-sm text-secondary-text line-clamp-2">{t.desc}</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-secondary-text">
              <span className="inline-flex items-center gap-1"><FileText size={13} /> {t.q} questions</span>
              <span className="inline-flex items-center gap-1"><Clock size={13} /> {t.mins} min</span>
            </div>
            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-muted text-secondary-text">{t.subject}</span>
              <Link to="/mock-tests/$id" params={{ id: t.id }}>
                <Button size="sm" className="font-semibold">Start Test <ArrowRight size={14} className="ml-1" /></Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
