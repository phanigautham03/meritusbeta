import { createFileRoute, Link } from "@tanstack/react-router";
import { MeritusLogo } from "@/components/meritus/MeritusLogo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Star, MessageSquarePlus, Bug, Lightbulb, Heart } from "lucide-react";

export const Route = createFileRoute("/feedback")({
  component: FeedbackPage,
  head: () => ({
    meta: [
      { title: "Beta Feedback — Meritus" },
      { name: "description", content: "Rate Meritus features, request new ones, report bugs, and share your story. We read and act on every submission." },
      { property: "og:title", content: "Beta Feedback — Meritus" },
      { property: "og:url", content: "https://meritus.co.in/feedback" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://meritus.co.in/feedback" }],
  }),
});

// ---------- helpers ----------
const FEATURES = [
  { key: "forget_meter",   label: "Forget-Meter",       low: "Doesn't help my retention at all",         high: "Can't study without it — it changed how I revise" },
  { key: "nta_simulator",  label: "NTA Simulator",       low: "Too different from the real exam",          high: "Felt exactly like the real exam — zero anxiety" },
  { key: "exam_match",     label: "ExamMatch AI",        low: "Recommendations felt generic",              high: "Recommended exams I genuinely hadn't considered" },
  { key: "study_planner",  label: "AI Study Planner",    low: "Plan didn't fit my schedule at all",        high: "Best study schedule I've ever had — actually follow it" },
  { key: "leaderboard",    label: "Leaderboard & Rank",  low: "Doesn't motivate me",                      high: "Checking my rank daily keeps me accountable" },
  { key: "ai_tutor",       label: "AI Tutor",            low: "Answers felt off or too generic",           high: "Explained better than my actual coaching teacher" },
  { key: "study_groups",   label: "Study Groups",        low: "Not useful — prefer solo study",            high: "Sharing with friends keeps us all accountable" },
  { key: "mentor_sessions",label: "Mentor Sessions",     low: "Wouldn't use this",                        high: "Access to a topper would change everything for me" },
];

const WISH_OPTIONS = [
  "Previous Year Papers (PYQs)",
  "Chapter / Topic-wise Practice Tests",
  "Video Lectures (5–15 min per topic)",
  "Voice AI Study Mode (listen while commuting)",
  "Current Affairs Digest (UPSC/Banking)",
  "Formula Sheets & Mind Maps",
  "Android Mobile App",
  "Wrong Answers Replay (like Magic Module)",
  "Custom Quiz Builder (choose topics + difficulty)",
  "Discussion & Doubt Clearing Community",
  "Mock Interview Prep (UPSC/CAT)",
  "Essay Writing Practice (UPSC mains)",
  "Bookmark Questions",
  "Score Trend Chart",
  "Grand Test Series (pan-India ranking)",
];

function RatingRow({ feat, value, onChange }: { feat: typeof FEATURES[0]; value: number; onChange: (v: number) => void }) {
  return (
    <div className="py-5 border-b border-border last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-body">{feat.label}</span>
        <span className={`text-sm font-bold w-8 text-right ${value === 0 ? "text-secondary-text" : value <= 3 ? "text-danger" : value <= 6 ? "text-gold" : "text-success"}`}>
          {value === 0 ? "—" : value}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-8 flex-1 rounded text-xs font-bold transition-all ${
              value === n
                ? n <= 3 ? "bg-danger text-white" : n <= 6 ? "bg-gold text-white" : "bg-success text-white"
                : "bg-muted/60 text-secondary-text hover:bg-primary-light hover:text-primary"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-secondary-text">
        <span>{feat.low}</span>
        <span className="text-right max-w-[45%]">{feat.high}</span>
      </div>
    </div>
  );
}

function FeedbackPage() {
  // -- state --
  const [nps, setNps] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [whatWorks, setWhatWorks] = useState("");
  const [whatNeeds, setWhatNeeds] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishOther, setWishOther] = useState("");
  const [bugDesc, setBugDesc] = useState("");
  const [bugSteps, setBugSteps] = useState("");
  const [storyName, setStoryName] = useState("");
  const [storyExam, setStoryExam] = useState("");
  const [storyQuote, setStoryQuote] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  function toggleWish(item: string) {
    setWishlist((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  }

  async function submit() {
    const hasContent = nps > 0 || Object.keys(ratings).length > 0 || whatWorks || whatNeeds || wishlist.length > 0 || wishOther || bugDesc || storyQuote;
    if (!hasContent) { toast.error("Please fill in at least one section before submitting."); return; }
    setSending(true);
    try {
      const payload = { nps, ratings, whatWorks, whatNeeds, wishlist: [...wishlist, wishOther].filter(Boolean), bugDesc, bugSteps, story: { name: storyName, exam: storyExam, quote: storyQuote }, email };
      // best-effort — silent fail is fine
      await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
      // also persist to localStorage
      try { localStorage.setItem("meritus_feedback_submitted", new Date().toISOString()); } catch {}
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-white">
          <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/"><MeritusLogo size="sm" theme="light" /></Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="h-16 w-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6">
              <Heart size={28} className="text-success fill-success" />
            </div>
            <h1 className="text-2xl font-bold text-body">Thank you — seriously.</h1>
            <p className="mt-3 text-secondary-text">
              Every rating, wish, and bug report shapes what we build next.
              We read every submission and will act on what matters most.
            </p>
            {email && (
              <p className="mt-3 text-sm text-secondary-text">
                We'll follow up at <strong>{email}</strong> if your feedback needs a response.
              </p>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/signup"><Button>Start preparing →</Button></Link>
              <Link to="/"><Button variant="outline">Back to home</Button></Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><MeritusLogo size="sm" theme="light" /></Link>
          <span className="text-xs text-secondary-text">Beta Feedback · All anonymous unless you share your email</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        {/* Intro */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light border border-primary/20 text-primary text-xs font-bold mb-4">
            <MessageSquarePlus size={12} /> Beta Feedback
          </div>
          <h1 className="text-3xl font-bold text-body">Help us build the right thing</h1>
          <p className="mt-3 text-secondary-text max-w-xl mx-auto">
            Every section is optional. Fill in what's relevant. Takes 3–5 minutes.
            We read and act on every submission.
          </p>
        </div>

        {/* 1 — NPS */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <Star size={18} className="text-gold" />
            <h2 className="font-semibold text-body">Overall — how likely are you to recommend Meritus?</h2>
          </div>
          <p className="text-xs text-secondary-text mb-4">0 = Definitely not · 10 = Already telling everyone</p>
          <div className="flex gap-1.5">
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <button
                key={n}
                onClick={() => setNps(n === nps ? 0 : n)}
                className={`h-10 flex-1 rounded font-bold text-sm transition-all ${
                  nps === n
                    ? n <= 6 ? "bg-danger text-white" : n <= 8 ? "bg-gold text-white" : "bg-success text-white"
                    : "bg-muted/60 text-secondary-text hover:bg-primary-light hover:text-primary"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-secondary-text">
            <span>Not at all likely</span>
            <span>Extremely likely</span>
          </div>
        </section>

        {/* 2 — Feature ratings */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <Check size={18} className="text-primary" />
            <h2 className="font-semibold text-body">Rate each feature (1–10)</h2>
          </div>
          <p className="text-xs text-secondary-text mb-2">Only rate features you've actually used. Skip the rest.</p>
          {FEATURES.map((f) => (
            <RatingRow
              key={f.key}
              feat={f}
              value={ratings[f.key] ?? 0}
              onChange={(v) => setRatings((prev) => ({ ...prev, [f.key]: prev[f.key] === v ? 0 : v }))}
            />
          ))}
        </section>

        {/* 3 — Open feedback */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-card space-y-5">
          <div className="flex items-center gap-2">
            <MessageSquarePlus size={18} className="text-primary" />
            <h2 className="font-semibold text-body">In your own words</h2>
          </div>
          <div>
            <Label className="text-sm font-medium">What's working really well for you?</Label>
            <Textarea
              className="mt-1.5 min-h-[80px]"
              placeholder="E.g. 'Forget-Meter actually changed how I revise — I stopped repeating topics I already know.'"
              value={whatWorks}
              onChange={(e) => setWhatWorks(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-sm font-medium">What needs the most improvement?</Label>
            <Textarea
              className="mt-1.5 min-h-[80px]"
              placeholder="E.g. 'The quiz timer should be visible on mobile without scrolling up.'"
              value={whatNeeds}
              onChange={(e) => setWhatNeeds(e.target.value)}
            />
          </div>
        </section>

        {/* 4 — Feature wishlist */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={18} className="text-gold" />
            <h2 className="font-semibold text-body">What would you like to see next?</h2>
          </div>
          <p className="text-xs text-secondary-text mb-4">Select everything you want. The most-requested features get built first.</p>
          <div className="flex flex-wrap gap-2">
            {WISH_OPTIONS.map((o) => (
              <button
                key={o}
                onClick={() => toggleWish(o)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                  wishlist.includes(o)
                    ? "bg-primary text-white border-primary"
                    : "bg-muted/50 text-body border-border hover:border-primary hover:text-primary"
                }`}
              >
                {wishlist.includes(o) && <Check size={10} className="inline mr-1" />}
                {o}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Label className="text-sm font-medium">Something else? Describe it.</Label>
            <Input
              className="mt-1.5"
              placeholder="E.g. 'Integration with my Google Calendar for study sessions'"
              value={wishOther}
              onChange={(e) => setWishOther(e.target.value)}
            />
          </div>
        </section>

        {/* 5 — Bug report */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Bug size={18} className="text-danger" />
            <h2 className="font-semibold text-body">Bug report (optional)</h2>
          </div>
          <div>
            <Label className="text-sm font-medium">What went wrong?</Label>
            <Textarea
              className="mt-1.5 min-h-[70px]"
              placeholder="E.g. 'Timer kept counting after I submitted the test.'"
              value={bugDesc}
              onChange={(e) => setBugDesc(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Steps to reproduce (optional)</Label>
            <Textarea
              className="mt-1.5 min-h-[70px]"
              placeholder="E.g. '1. Start JEE mock test 2. Answer 5 questions 3. Click Submit 4. Timer still running'"
              value={bugSteps}
              onChange={(e) => setBugSteps(e.target.value)}
            />
          </div>
        </section>

        {/* 6 — Success story */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-success" />
            <h2 className="font-semibold text-body">Share your story (optional)</h2>
          </div>
          <p className="text-xs text-secondary-text">
            If Meritus has genuinely helped your prep, we'd love to feature your story on the landing page (with your permission).
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Your first name</Label>
              <Input className="mt-1.5" placeholder="Priya" value={storyName} onChange={(e) => setStoryName(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Exam you're preparing for</Label>
              <Input className="mt-1.5" placeholder="JEE Advanced 2026" value={storyExam} onChange={(e) => setStoryExam(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">In one sentence, how has Meritus helped?</Label>
            <Textarea
              className="mt-1.5 min-h-[70px]"
              placeholder="E.g. 'Forget-Meter showed me I was forgetting Organic Chemistry every 4 days — now I revise it on schedule and my test scores are up 18%.'"
              value={storyQuote}
              onChange={(e) => setStoryQuote(e.target.value)}
            />
          </div>
        </section>

        {/* 7 — Email + submit */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
          <div>
            <Label className="text-sm font-medium">Your email (optional)</Label>
            <p className="text-xs text-secondary-text mt-0.5 mb-1.5">Only if you'd like us to follow up — we never spam.</p>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button onClick={submit} disabled={sending} className="w-full font-semibold h-12">
            {sending ? "Submitting…" : "Submit feedback"}
          </Button>
          <p className="text-center text-xs text-secondary-text">
            All sections are optional. We read every submission and prioritise accordingly.
          </p>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#0F0D2E] text-indigo-200 px-6 py-8 text-sm mt-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <MeritusLogo size="sm" theme="dark" />
          <div className="flex gap-6 text-xs">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
          </div>
          <span className="text-xs text-indigo-400">© {new Date().getFullYear()} Meritus · Made in India 🇮🇳</span>
        </div>
      </footer>
    </div>
  );
}
