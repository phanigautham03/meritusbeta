import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MeritusLogo } from "@/components/meritus/MeritusLogo";
import {
  Check, ArrowRight, Building2, Users, BarChart3, Brain,
  Shield, Zap, Star, Mail,
} from "lucide-react";

export const Route = createFileRoute("/institutes")({
  component: InstitutesPage,
  head: () => ({
    meta: [
      { title: "Meritus for Coaching Institutes — AI Exam Prep Platform" },
      { name: "description", content: "AI-powered mock test platform for coaching institutes. Forget-Meter, analytics dashboard, bulk student management — starts at ₹30,000/year. Live in 48 hours." },
      { property: "og:title", content: "Meritus for Coaching Institutes — AI-Powered Exam Prep Platform" },
      { property: "og:description", content: "Give your students an AI-powered edge. Forget-Meter, NTA simulator, analytics dashboard and bulk management — from ₹600/student/year." },
      { property: "og:url", content: "https://meritus.co.in/institutes" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://meritus.co.in/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Meritus for Coaching Institutes — AI-Powered Exam Prep Platform" },
      { name: "twitter:description", content: "Give your students an AI-powered edge. Forget-Meter, NTA simulator, analytics dashboard and bulk management — from ₹600/student/year." },
      { name: "twitter:image", content: "https://meritus.co.in/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://meritus.co.in/institutes" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "How long does setup take?", acceptedAnswer: { "@type": "Answer", text: "Most institutes are live within 48 hours. We handle the onboarding — you just send us your student list as a CSV." } },
            { "@type": "Question", name: "Can I upload my own questions?", acceptedAnswer: { "@type": "Answer", text: "Yes, on Growth and Enterprise plans you can upload your DPP questions, previous year papers, and chapter tests." } },
            { "@type": "Question", name: "Is there a free trial?", acceptedAnswer: { "@type": "Answer", text: "Yes — 30-day free trial for up to 15 students. No credit card required." } },
            { "@type": "Question", name: "Which exams are covered?", acceptedAnswer: { "@type": "Answer", text: "JEE Main, JEE Advanced, NEET UG, UPSC CSE, GATE, CAT, SSC CGL, IBPS PO/Clerk, CUET — more added monthly." } },
            { "@type": "Question", name: "Do students need to download anything?", acceptedAnswer: { "@type": "Answer", text: "No. Meritus is fully browser-based. Works on any device — no app required." } },
          ],
        }),
      },
    ],
  }),
});

const benefits = [
  {
    icon: Brain,
    title: "AI-powered mock tests",
    desc: "900+ questions across JEE, NEET, UPSC, GATE, CAT, Banking — all exam-pattern aligned. Add your own questions too.",
  },
  {
    icon: BarChart3,
    title: "Institute analytics dashboard",
    desc: "See every student's score, rank, weak topics, and retention scores in one place. Weekly progress reports auto-generated.",
  },
  {
    icon: Users,
    title: "Bulk student management",
    desc: "Onboard entire batches via CSV. Assign exams, set test schedules, and track completion — without chasing students.",
  },
  {
    icon: Shield,
    title: "Forget-Meter for your batch",
    desc: "Know exactly which topics your batch is forgetting before the exam. Ebbinghaus-curve-based retention for every student.",
  },
  {
    icon: Zap,
    title: "NTA-style simulator",
    desc: "Students practice on a pixel-perfect replica of the actual JEE/NEET interface. Zero exam-day anxiety.",
  },
  {
    icon: Building2,
    title: "Your brand, our tech",
    desc: "Optional white-labelling — your institute name and logo on the dashboard. Students see your brand, powered by Meritus.",
  },
];

const plans = [
  {
    name: "Starter",
    students: "Up to 50 students",
    price: "₹30,000",
    period: "/year",
    perStudent: "₹600/student/year",
    features: [
      "All mock tests (900+ questions)",
      "Forget-Meter for all students",
      "Institute analytics dashboard",
      "Bulk student onboarding",
      "Email support",
    ],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Growth",
    students: "Up to 200 students",
    price: "₹75,000",
    period: "/year",
    perStudent: "₹375/student/year",
    features: [
      "Everything in Starter",
      "Custom test scheduling",
      "Weekly PDF reports per student",
      "WhatsApp alerts for low retention",
      "Priority support",
      "Meritus branding removable",
    ],
    cta: "Most popular",
    featured: true,
  },
  {
    name: "Enterprise",
    students: "500+ students",
    price: "Custom",
    period: "",
    perStudent: "Contact us for pricing",
    features: [
      "Everything in Growth",
      "Full white-labelling",
      "Custom question bank upload",
      "API access",
      "Dedicated account manager",
      "On-site training session",
    ],
    cta: "Talk to us",
    featured: false,
  },
];

const faqs = [
  {
    q: "How long does setup take?",
    a: "Most institutes are live within 48 hours. We handle the onboarding — you just send us your student list as a CSV.",
  },
  {
    q: "Can I upload my own questions?",
    a: "Yes, on Growth and Enterprise plans you can upload your DPP questions, previous year papers, and chapter tests.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — 30-day free trial for up to 15 students. No credit card required.",
  },
  {
    q: "Which exams are covered?",
    a: "JEE Main, JEE Advanced, NEET UG, UPSC CSE, GATE, CAT, SSC CGL, IBPS PO/Clerk, CUET — more added monthly.",
  },
  {
    q: "Do students need to download anything?",
    a: "No. Meritus is fully browser-based. Works on any device — no app required.",
  },
];

function InstitutesPage() {
  function openWhatsApp() {
    const msg = "Hi! I'm interested in Meritus for my coaching institute. Can you share more details?";
    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><MeritusLogo size="md" theme="dark" showTagline /></Link>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Log in</Button></Link>
            <Button
              className="bg-white text-navy hover:bg-white/90 font-semibold"
              onClick={openWhatsApp}
            >
              Talk to us
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-primary text-white pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium mb-6">
            <Building2 size={12} /> For Coaching Institutes
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Give your students an<br />
            <span className="text-gold">AI-powered edge.</span>
          </h1>
          <p className="mt-6 text-lg text-indigo-200 max-w-2xl mx-auto">
            Meritus gives coaching institutes a complete AI exam prep platform — mock tests, Forget-Meter, analytics, and NTA-simulator — for less than{" "}
            <strong className="text-white">₹600 per student per year.</strong>
          </p>
          <div className="mt-4 text-sm text-indigo-300">
            Compare: traditional coaching franchise fees start at ₹20 lakh+. Meritus starts at ₹30,000/year.
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-navy hover:bg-white/90 font-bold h-12 px-7"
              onClick={openWhatsApp}
            >
              Start 30-day free trial <ArrowRight className="ml-2" size={16} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white h-12 px-7"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            >
              See pricing
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-indigo-200">
            {["No per-student setup fees", "Live in 48 hours", "30-day free trial"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <div className="bg-white border-b border-border py-4 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 text-center text-sm">
          {[
            ["900+", "Questions across 9 exams"],
            ["NTA-Style", "Exam interface"],
            ["AI-Powered", "Forget-Meter"],
            ["48hrs", "Onboarding"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-bold text-primary text-base">{n}</div>
              <div className="text-secondary-text text-xs">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="label-caps text-primary">Why Meritus</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-body">
              Everything your institute needs. Nothing it doesn't.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-card border border-border rounded-xl p-6 shadow-card hover:border-primary/30 transition-colors">
                  <div className="h-11 w-11 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-body">{b.title}</h3>
                  <p className="mt-2 text-sm text-secondary-text leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vs comparison */}
      <section className="bg-navy py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">
            What does ₹30,000/year actually get you?
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {[
              { label: "Traditional franchise", cost: "₹20 lakh+", what: "Joining fee alone", color: "text-red-400" },
              { label: "Build in-house", cost: "₹5–10 lakh", what: "Dev cost + 6 months", color: "text-amber-400" },
              { label: "Meritus", cost: "₹30,000/yr", what: "Live in 48 hours", color: "text-emerald-400", highlight: true },
            ].map((r) => (
              <div
                key={r.label}
                className={`rounded-xl p-5 ${r.highlight ? "bg-primary border-2 border-white/20" : "bg-white/5 border border-white/10"}`}
              >
                <div className="text-indigo-200 text-xs mb-2">{r.label}</div>
                <div className={`text-2xl font-bold ${r.color}`}>{r.cost}</div>
                <div className="text-indigo-300 text-xs mt-1">{r.what}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="label-caps text-primary">Pricing</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-body">Simple annual pricing</h2>
            <p className="mt-3 text-secondary-text">No per-student charges. No hidden fees. One flat annual price.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-xl bg-card p-7 shadow-card border ${
                  p.featured ? "border-primary border-2 shadow-[0_8px_25px_rgba(67,56,202,0.15)]" : "border-border"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-lg font-semibold text-body">{p.name}</h3>
                <div className="text-xs text-secondary-text mt-1">{p.students}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-body">{p.price}</span>
                  {p.period && <span className="text-secondary-text text-sm">{p.period}</span>}
                </div>
                <div className="text-xs text-success mt-1">{p.perStudent}</div>
                <Button
                  className={`mt-5 w-full ${p.featured ? "" : "bg-card border border-primary text-primary hover:bg-primary-light"}`}
                  onClick={openWhatsApp}
                >
                  {p.cta}
                </Button>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check size={14} className="text-success mt-0.5 shrink-0" />
                      <span className="text-body">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-body text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-card border border-border rounded-xl p-5">
                <div className="font-semibold text-body text-sm">{f.q}</div>
                <div className="mt-2 text-sm text-secondary-text leading-relaxed">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="bg-navy py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-white">Ready to modernise your coaching?</h2>
        <p className="mt-3 text-indigo-200 max-w-xl mx-auto">
          30-day free trial. No credit card. Your students can be on Meritus in 48 hours.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            className="bg-white text-navy hover:bg-white/90 font-bold h-12 px-7"
            onClick={openWhatsApp}
          >
            WhatsApp us to get started
          </Button>
          <a href="mailto:institutes@meritus.co.in">
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white h-12 px-7 gap-2"
            >
              <Mail size={16} /> Email us
            </Button>
          </a>
        </div>
        <p className="mt-6 text-xs text-indigo-400">
          Or call/WhatsApp: <strong className="text-indigo-200">+91 99999 99999</strong> · Mon–Sat, 9am–7pm IST
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F0D2E] text-indigo-200 px-6 py-8 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <MeritusLogo size="sm" theme="dark" />
          <div className="flex gap-6 text-xs">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
          <span className="text-xs text-indigo-400">© {new Date().getFullYear()} Meritus · Made in India 🇮🇳</span>
        </div>
      </footer>
    </div>
  );
}
