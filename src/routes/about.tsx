import { createFileRoute, Link } from "@tanstack/react-router";
import { MeritusLogo } from "@/components/meritus/MeritusLogo";
import { Button } from "@/components/ui/button";
import { Brain, Target, Zap, Heart, Mail, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About Meritus — Built for India's Exam Aspirants" },
      { name: "description", content: "Meritus is India's AI-powered exam prep platform — built to make world-class preparation accessible to every aspirant, not just those near coaching hubs." },
      { property: "og:title", content: "About Meritus — Built for India's Exam Aspirants" },
      { property: "og:description", content: "Meritus is India's AI-powered exam prep platform — built to make world-class preparation accessible to every aspirant, not just those near coaching hubs." },
      { property: "og:url", content: "https://meritus.co.in/about" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://meritus.co.in/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About Meritus — Built for India's Exam Aspirants" },
      { name: "twitter:description", content: "Meritus is India's AI-powered exam prep platform — built to make world-class preparation accessible to every aspirant." },
      { name: "twitter:image", content: "https://meritus.co.in/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://meritus.co.in/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Meritus",
          url: "https://meritus.co.in/about",
          description: "Meritus is India's AI-powered competitive exam prep platform covering JEE, NEET, UPSC, GATE, CAT and 200+ exams.",
          publisher: {
            "@type": "Organization",
            name: "Meritus",
            url: "https://meritus.co.in/",
          },
        }),
      },
    ],
  }),
});

const pillars = [
  {
    icon: Brain,
    title: "Science-backed retention",
    desc: "The Ebbinghaus forgetting curve shows exactly when your brain forgets — and exactly when to revise. We built Forget-Meter around this, so you study smarter, not longer.",
  },
  {
    icon: Target,
    title: "Zero exam-day surprises",
    desc: "Our NTA-style simulator replicates the exact JEE/NEET interface — question palette, timer, mark-for-review. Students who practise here arrive at the real exam with muscle memory, not anxiety.",
  },
  {
    icon: Zap,
    title: "AI that knows your syllabus",
    desc: "ExamMatch AI analyses your profile against 200+ Indian competitive exams. The AI Tutor knows JEE, NEET, UPSC, GATE, CAT syllabi cold. Every answer is syllabus-aligned, not generic.",
  },
  {
    icon: Heart,
    title: "Accessible to every aspirant",
    desc: "Traditional coaching costs ₹1–3 lakh/year and requires you to live near a coaching hub. Meritus costs ₹499/month and works on any device, from any city, at 2am before your exam.",
  },
];

const numbers = [
  { n: "200+", label: "Exams covered" },
  { n: "900+", label: "Mock test questions" },
  { n: "48 hrs", label: "Institute onboarding" },
  { n: "₹499/mo", label: "Pro plan price" },
];

function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><MeritusLogo size="sm" theme="light" /></Link>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="text-sm text-secondary-text hover:text-body">Contact</Link>
            <Link to="/signup"><Button size="sm">Start free</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-primary text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium mb-6">
            Made in India 🇮🇳
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Merit, Mastered.
          </h1>
          <p className="mt-6 text-lg text-indigo-200 max-w-2xl mx-auto">
            Every year, over 2.5 crore Indians sit for competitive exams.
            Most prepare with coaching that costs ₹1–3 lakh/year, requires them to relocate,
            and teaches in batches of 200. We built Meritus because that's broken — and fixable.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="label-caps text-primary">Our Mission</span>
            <h2 className="mt-2 text-3xl font-bold text-body">
              World-class preparation for every aspirant — regardless of city or budget.
            </h2>
            <p className="mt-4 text-secondary-text leading-relaxed">
              Whether you're in Delhi or Darbhanga, whether you study at 6am or midnight,
              Meritus gives you the same AI-powered edge that Kota's top coaching centres promise
              — at a fraction of the cost, with none of the geography dependency.
            </p>
            <p className="mt-4 text-secondary-text leading-relaxed">
              We're not building another question bank. We're building the platform that helps you
              retain what you study (Forget-Meter), practise the real exam interface (NTA simulator),
              and get AI to personalise your preparation (ExamMatch + Study Planner) — all in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {["Zero commute", "Study at 2am", "AI that knows your syllabus", "Cheaper than 1 month's coaching"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-light text-primary font-medium">
                  <Check size={12} /> {t}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {numbers.map((s) => (
              <div key={s.n} className="bg-card border border-border rounded-xl p-5 shadow-card text-center">
                <div className="text-3xl font-bold text-primary">{s.n}</div>
                <div className="text-xs text-secondary-text mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="label-caps text-primary">Why we built this</span>
            <h2 className="mt-2 text-3xl font-bold text-body">Four principles behind every feature</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-card border border-border rounded-xl p-6 shadow-card">
                  <div className="h-10 w-10 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-body">{p.title}</h3>
                  <p className="mt-2 text-sm text-secondary-text leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="label-caps text-primary">Who Meritus is for</span>
          <h2 className="mt-2 text-2xl font-bold text-body">Three kinds of people. One platform.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              title: "Students (16–22)",
              label: "JEE · NEET · CUET · Banking",
              desc: "You need mock tests, retention tracking, and an AI that knows your syllabus — not generic content.",
              cta: "Start preparing",
              to: "/signup",
            },
            {
              title: "Working professionals (23–35)",
              label: "UPSC · GATE · CAT · MBA",
              desc: "You have 2 hours a day max. You need a system that makes every hour count — no wasted revision.",
              cta: "See how it works",
              to: "/signup",
            },
            {
              title: "Coaching institutes",
              label: "B2B · Whitelabelled platform",
              desc: "You want AI analytics, bulk student management, and Forget-Meter for your whole batch — at ₹600/student/year.",
              cta: "See institute plans",
              to: "/institutes",
            },
          ].map((s) => (
            <div key={s.title} className="bg-card border border-border rounded-xl p-6 shadow-card flex flex-col">
              <div className="text-xs font-bold text-primary mb-2">{s.label}</div>
              <h3 className="font-semibold text-body">{s.title}</h3>
              <p className="mt-2 text-sm text-secondary-text leading-relaxed flex-1">{s.desc}</p>
              <Link to={s.to}>
                <Button variant="outline" size="sm" className="mt-4 w-full gap-1.5">
                  {s.cta} <ArrowRight size={12} />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-navy py-14 px-6 text-center">
        <h2 className="text-2xl font-bold text-white">Questions, partnerships, or just want to talk?</h2>
        <p className="mt-3 text-indigo-200 text-sm max-w-lg mx-auto">
          We read every email. If you have feedback, a bug to report, or want to explore an institute partnership — reach out.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/contact">
            <Button size="lg" className="bg-white text-navy hover:bg-white/90 font-bold gap-2">
              <Mail size={16} /> Contact us
            </Button>
          </Link>
          <Link to="/feedback">
            <Button size="lg" variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white gap-2">
              Give beta feedback →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F0D2E] text-indigo-200 px-6 py-8 text-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <MeritusLogo size="sm" theme="dark" />
          <div className="flex gap-6 text-xs">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
          <span className="text-xs text-indigo-400">© {new Date().getFullYear()} Meritus · Made in India 🇮🇳</span>
        </div>
      </footer>
    </div>
  );
}
