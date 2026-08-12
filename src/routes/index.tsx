import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/integrations/external-supabase/auth-context";
import { Button } from "@/components/ui/button";
import {
  Brain, Monitor, Sparkles, CalendarDays, TrendingUp, Users,
  Check, Star, ArrowRight, X, Send, MessageSquarePlus,
} from "lucide-react";
import { FeedbackSection } from "@/components/meritus/FeedbackSection";
import { MeritusLogo } from "@/components/meritus/MeritusLogo";
import heroStudent from "@/assets/hero-student.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Meritus — AI Exam Prep for JEE, NEET, UPSC & 200+ Exams" },
      { name: "description", content: "India's AI-powered exam prep for JEE, NEET, UPSC, GATE, CAT & 200+ exams. AI Forget-Meter, NTA simulator, personalised study plans. Free to start." },
      { property: "og:title", content: "Meritus — AI Exam Prep for JEE, NEET, UPSC & 200+ Exams" },
      { property: "og:description", content: "AI-powered mock tests, Forget-Meter, and personalised study plans for JEE, NEET, UPSC, GATE, CAT, Banking & 200+ Indian competitive exams." },
      { property: "og:url", content: "https://meritus.co.in/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://meritus.co.in/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Meritus — AI Exam Prep for JEE, NEET, UPSC & 200+ Exams" },
      { name: "twitter:description", content: "AI-powered mock tests, Forget-Meter, and personalised study plans for JEE, NEET, UPSC, GATE, CAT, Banking & 200+ Indian competitive exams." },
      { name: "twitter:image", content: "https://meritus.co.in/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://meritus.co.in/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Meritus",
          url: "https://meritus.co.in/",
          logo: {
            "@type": "ImageObject",
            url: "https://meritus.co.in/og-image.png",
            width: 1200,
            height: 630,
          },
          description: "AI-powered competitive exam prep for JEE, NEET, UPSC, Banking, GATE, CAT and 200+ exams.",
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: "hello@meritus.co.in",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Meritus",
          url: "https://meritus.co.in/",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Meritus",
          operatingSystem: "Web, Android",
          applicationCategory: "EducationApplication",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
          },
          description: "AI-powered mock test platform for JEE, NEET, UPSC, GATE, CAT, Banking and 200+ Indian competitive exams. Features Forget-Meter, NTA simulator, ExamMatch AI, and personalised study plans.",
          url: "https://meritus.co.in/",
        }),
      },
    ],
  }),
});

const examPills = ["JEE Main", "NEET UG", "UPSC CSE", "GATE", "CAT", "SSC CGL", "IBPS PO", "CUET"];

const features = [
  {
    icon: Brain, color: "teal", title: "Forget-Meter AI",
    desc: "Ebbinghaus forgetting curve tracks exactly when you'll forget each topic.",
    to: "/forget-meter" as const,
    howTo: [
      "After any quiz or mock test, Forget-Meter auto-logs the topics you studied.",
      "Each topic gets a retention score that decays over time using the Ebbinghaus curve.",
      "Visit Forget-Meter daily — topics dropping below 40% are flagged in red. Click 'Revise' to reset the score.",
    ],
  },
  {
    icon: Monitor, color: "primary", title: "NTA Exam Simulator",
    desc: "Pixel-perfect replica of the actual JEE/NEET interface with real-time timer.",
    to: "/mock-tests" as const,
    howTo: [
      "Go to Mock Tests and pick any exam (JEE, NEET, UPSC, etc.).",
      "The interface replicates the NTA exam UI — question palette, timer, mark-for-review.",
      "Submit when done to see your score, rank estimate, and detailed explanations.",
    ],
  },
  {
    icon: Sparkles, color: "gold", title: "ExamMatch AI",
    desc: "Claude AI analyses your profile and recommends the best-fit exams for you.",
    to: "/ai-tutor" as const,
    howTo: [
      "Complete your onboarding profile (education level, study hours, target date).",
      "ExamMatch AI calls Claude and analyses your background against all 200+ exams.",
      "Get a ranked list of best-fit exams with match % and a one-line personalised reason.",
    ],
  },
  {
    icon: CalendarDays, color: "purple", title: "AI Study Planner",
    desc: "Personalised week-by-week study schedule generated by AI.",
    to: "/study-planner" as const,
    howTo: [
      "Go to Study Planner and enter your exam date and daily study hours.",
      "The AI analyses your weak topics from Forget-Meter and test results.",
      "Get a day-by-day schedule with subjects, topics, and revision slots — export or follow in-app.",
    ],
  },
  {
    icon: TrendingUp, color: "success", title: "Rank Predictor",
    desc: "Know your expected rank before the result.",
    to: "/leaderboard" as const,
    howTo: [
      "Take at least one mock test to generate your performance data.",
      "Leaderboard shows your merit points and rank among Meritus students.",
      "Your rank percentile is calibrated against past year actual exam cutoffs.",
    ],
  },
  {
    icon: Users, color: "blue", title: "Mentor Connect",
    desc: "1-on-1 sessions with toppers who cracked your target exam.",
    to: "/mentor-sessions" as const,
    howTo: [
      "Browse mentors filtered by exam (JEE, NEET, UPSC, CAT) and price.",
      "Book a 45-minute 1-on-1 video session directly in the app.",
      "Get a personalised strategy call, study plan review, and Q&A with a proven topper.",
    ],
  },
];

const colorMap: Record<string, string> = {
  teal: "bg-teal-light text-teal",
  primary: "bg-primary-light text-primary",
  gold: "bg-gold-light text-gold",
  purple: "bg-violet-50 text-violet-600",
  success: "bg-success-light text-success",
  blue: "bg-sky-50 text-sky-600",
};


const plans = [
  {
    name: "Free", price: "₹0", sub: "Forever", cta: "Start free", featured: false,
    features: [["3 mock tests / month", true], ["Basic analytics", true], ["ExamMatch AI", true], ["AI Study Planner", false], ["Forget-Meter", false], ["Mentor sessions", false]],
  },
  {
    name: "Pro", price: "₹499", sub: "/month", cta: "Go Pro", featured: true,
    features: [["Unlimited mock tests", true], ["Full analytics", true], ["ExamMatch AI", true], ["AI Study Planner", true], ["Forget-Meter", true], ["Mentor sessions", false]],
  },
  {
    name: "Power", price: "₹999", sub: "/month", cta: "Get Power", featured: false,
    features: [["Everything in Pro", true], ["1-on-1 Mentor sessions", true], ["Voice AI tutor", true], ["Priority support", true], ["Custom study plan", true], ["Early-access features", true]],
  },
];

function Landing() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Logged-in banner */}
      {!loading && user && (
        <div className="fixed top-0 inset-x-0 z-50 bg-primary text-white text-center text-sm py-2 flex items-center justify-center gap-3">
          <span>You're logged in as <strong>{user.email}</strong></span>
          <Link to="/dashboard">
            <Button size="sm" className="bg-white text-primary hover:bg-white/90 h-7 px-3 text-xs font-bold">
              Go to Dashboard →
            </Button>
          </Link>
        </div>
      )}

      {/* Top nav */}
      <header className={`absolute inset-x-0 z-20 ${!loading && user ? "top-10" : "top-0"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <MeritusLogo size="sm" theme="dark" showTagline />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-indigo-100">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <Link to="/leaderboard" className="hover:text-white">Leaderboard</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/institutes" className="hover:text-white font-medium text-gold">For Institutes</Link>
          </nav>
          <div className="flex items-center gap-2">
            {!loading && user ? (
              <Link to="/dashboard">
                <Button className="bg-white text-navy hover:bg-white/90 font-semibold">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Log in</Button></Link>
                <Link to="/signup"><Button className="bg-white text-navy hover:bg-white/90 font-semibold">Sign up</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-2 text-white pt-28 pb-24">
        <div className="absolute inset-0 bg-dot-grid opacity-60" />
        {/* floating pills */}
        {examPills.map((p, i) => (
          <span
            key={p}
            className="hidden lg:block absolute text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-indigo-100"
            style={{
              top: `${15 + (i % 4) * 18}%`,
              left: i < 4 ? `${4 + i * 2}%` : undefined,
              right: i >= 4 ? `${4 + (i - 4) * 2}%` : undefined,
              animation: `float ${5 + (i % 3)}s ease-in-out ${i * 0.4}s infinite`,
            }}
          >
            {p}
          </span>
        ))}

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
          <h1 className="mt-6 text-5xl md:text-[56px] font-bold leading-[1.05] tracking-tight">
            Study smarter, not harder.
            <br />
            <span className="text-gradient-hero">AI by your side.</span>
          </h1>
          <p className="mt-6 text-lg text-indigo-200 max-w-2xl mx-auto lg:mx-0">
            Prep for JEE, NEET, UPSC, Banking, GATE, CAT and 200+ Indian competitive exams — all in one
            AI-first platform designed by students who've been where you are.
          </p>
          <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm">
            {["Free to start", "All 200+ exams", "AI-powered weak spot detection"].map((t) => (
              <span key={t} className="inline-flex items-center gap-2 text-indigo-100">
                <Check size={16} className="text-emerald-400" /> {t}
              </span>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap justify-center lg:justify-start gap-3">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-navy hover:bg-white/90 font-bold h-12 px-7">
                Start for free <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 hover:text-white bg-transparent h-12 px-7">
              See how it works
            </Button>
          </div>
          </div>

          {/* Hero image */}
          <div className="relative mx-auto lg:mx-0 w-full max-w-xl">
            <div className="absolute -inset-6 bg-gradient-to-tr from-primary/40 via-violet-500/20 to-gold/30 blur-3xl rounded-full opacity-70" />
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
              <img
                src={heroStudent}
                alt="Indian student preparing for competitive exams with Meritus AI"
                width={1024}
                height={1024}
                className="w-full h-auto block"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
            </div>
            {/* floating badge */}
            <div className="hidden sm:flex absolute -bottom-5 -left-5 items-center gap-3 rounded-xl bg-white text-navy px-4 py-3 shadow-xl">
              <div className="h-9 w-9 rounded-full bg-gold-light flex items-center justify-center">
                <Star size={16} className="text-gold fill-gold" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold leading-none">AIR 287</div>
                <div className="text-[11px] text-secondary-text mt-1">JEE Adv 2024</div>
              </div>
            </div>
            <div className="hidden sm:flex absolute -top-4 -right-4 items-center gap-2 rounded-xl bg-white text-navy px-3 py-2 shadow-xl">
              <div className="h-8 w-8 rounded-lg bg-teal-light flex items-center justify-center">
                <TrendingUp size={14} className="text-teal" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-none">+47% rank</div>
                <div className="text-[10px] text-secondary-text mt-0.5">in 90 days</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 mt-16 text-center">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["200+", "Exams covered"],
              ["900+", "Mock test questions"],
              ["AI-First", "Platform"],
              ["Free", "To start"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm p-5">
                <div className="text-2xl md:text-3xl font-bold text-white">{n}</div>
                <div className="text-xs text-indigo-200 mt-1">{l}</div>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {["Forget-Meter AI", "ExamMatch AI", "Rank Predictor", "NTA UI Simulator"].map((f) => (
              <span key={f} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-indigo-100">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* Dashboard Preview — OG image */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <span className="label-caps text-primary">Platform Preview</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-body">See what your dashboard looks like</h2>
          <p className="mt-3 text-secondary-text text-sm max-w-xl mx-auto">
            Everything in one place — live score, rank, streak, and your Forget-Meter retention scores.
          </p>
          <div className="mt-8 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 via-violet-400/10 to-gold/10 blur-2xl rounded-3xl" />
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-[0_20px_60px_-10px_rgba(67,56,202,0.2)] ring-1 ring-border">
              <img
                src="/og-image.png"
                alt="Meritus dashboard preview — score ring, rank, Forget-Meter bars"
                className="w-full h-auto block"
                loading="lazy"
                width={1200}
                height={630}
              />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-secondary-text">
            {["Live retention scores", "Mock test rank", "Study streak tracker", "Weak topic alerts"].map((l) => (
              <span key={l} className="flex items-center gap-1.5">
                <Check size={12} className="text-success" /> {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="label-caps text-primary">Features</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-body">Everything you need to crack your exam</h2>
            <p className="mt-3 text-secondary-text max-w-2xl mx-auto">
              Built by toppers, designed for toppers. Every feature comes from what actually works — not what looks good on a slide.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.title}
                  to={f.to}
                  className="group relative block bg-card border border-border rounded-xl p-6 shadow-card hover:border-indigo-200 hover:shadow-[0_8px_25px_rgba(67,56,202,0.15)] hover:-translate-y-1 transition-all overflow-hidden"
                >
                  {/* Default state */}
                  <div className="transition-opacity duration-200 group-hover:opacity-0">
                    <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${colorMap[f.color]}`}>
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-body">{f.title}</h3>
                    <p className="mt-2 text-sm text-secondary-text leading-relaxed">{f.desc}</p>
                  </div>

                  {/* Hover overlay — How to use */}
                  <div className="absolute inset-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between bg-card">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorMap[f.color]}`}>
                          <Icon size={16} />
                        </div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">How to use</span>
                      </div>
                      <h3 className="font-semibold text-body text-sm mb-3">{f.title}</h3>
                      <ol className="space-y-2">
                        {f.howTo.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-body leading-relaxed">
                            <span className={`shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5 ${colorMap[f.color].replace("text-", "bg-").replace(/bg-\S+-light\s?/g, "")}`}
                              style={{ background: "currentColor" }}
                            >
                              <span className={colorMap[f.color].split(" ")[1]}>{i + 1}</span>
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="mt-3 text-xs text-primary font-semibold flex items-center gap-1">
                      <ArrowRight size={12} /> Try it now
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials — real stories wanted */}
      <section className="bg-navy py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="label-caps text-indigo-300">Real Stories. No Stock Photos.</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-white">
            This wall belongs to our first users.
          </h2>
          <p className="mt-4 text-indigo-200 max-w-2xl mx-auto">
            We don't fabricate testimonials. When a Meritus beta user cracks their exam — or has
            a moment where the Forget-Meter, NTA simulator, or ExamMatch AI genuinely helped —
            that story goes here, with their real name and rank.
            <span className="text-white font-semibold"> The first three spots are yours.</span>
          </p>

          {/* 3 open invitation cards */}
          <div className="mt-10 grid md:grid-cols-3 gap-5 text-left">
            {[
              { slot: "01", exam: "JEE / NEET aspirant", prompt: "Did the NTA simulator make the real exam feel familiar? Tell us." },
              { slot: "02", exam: "UPSC / GATE / CAT aspirant", prompt: "Did Forget-Meter catch something you'd have missed? We want that story." },
              { slot: "03", exam: "Any exam", prompt: "Did ExamMatch AI point you somewhere unexpected — and right? Share it." },
            ].map((c) => (
              <div key={c.slot} className="rounded-xl bg-white/[0.04] border border-white/10 p-6 backdrop-blur-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 tracking-widest">SPOT {c.slot}</span>
                  <span className="text-[10px] text-indigo-500 font-medium">{c.exam}</span>
                </div>
                <p className="text-sm text-indigo-200 leading-relaxed italic">"{c.prompt}"</p>
                <div className="flex gap-0.5 mt-auto">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="text-gold/30 fill-gold/20" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/feedback">
              <Button className="bg-white text-navy hover:bg-white/90 font-bold gap-2 h-11 px-6">
                <MessageSquarePlus size={15} />
                Share your story — claim a spot
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent h-11 px-6 gap-2">
                <Star size={14} className="text-gold fill-gold" />
                Join beta free
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-indigo-500">
            Stories submitted via the feedback page. We review, confirm accuracy, and feature with your permission.
          </p>
        </div>
      </section>

      {/* Telegram Community */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold mb-4">
            <Send size={12} /> Free Community — No signup required
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-body">Free Telegram study communities — one for every exam</h2>
          <p className="mt-3 text-secondary-text max-w-xl mx-auto text-sm">
            Daily mock test links, toppers' strategies, doubt clearing, and exam news — all free.
            Join your exam channel and study with India's most motivated batch.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {[
              { label: "JEE Community", href: "https://t.me/meritusjee", emoji: "🎯" },
              { label: "NEET Community", href: "https://t.me/meritusneet", emoji: "🩺" },
              { label: "UPSC Community", href: "https://t.me/meritusupsc", emoji: "🏛️" },
              { label: "Banking / SSC", href: "https://t.me/meritusbanking", emoji: "🏦" },
              { label: "CAT / MBA", href: "https://t.me/merituscat", emoji: "📊" },
            ].map((ch) => (
              <a
                key={ch.label}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                {ch.emoji} {ch.label}
              </a>
            ))}
          </div>
          <p className="mt-5 text-xs text-secondary-text">
            Free forever · No spam · Moderated by toppers
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="label-caps text-primary">Pricing</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-body">Simple, transparent pricing</h2>
            <p className="mt-3 text-secondary-text">Start free. Upgrade when you're ready to go all in.</p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-sm text-success font-medium">
              <Check size={14} />
              Traditional coaching costs ₹1–3 lakh/year. Meritus Pro is ₹499/month — typically under 3% of those fees.
            </div>
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
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-body">{p.price}</span>
                  <span className="text-secondary-text text-sm">{p.sub}</span>
                </div>
                <Link to="/signup">
                  <Button className={`mt-6 w-full ${p.featured ? "" : "bg-card border border-primary text-primary hover:bg-primary-light"}`}>
                    {p.cta}
                  </Button>
                </Link>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map(([feat, on]) => (
                    <li key={String(feat)} className="flex items-start gap-2">
                      {on ? <Check size={16} className="text-success mt-0.5 shrink-0" /> : <X size={16} className="text-muted-text mt-0.5 shrink-0" />}
                      <span className={on ? "text-body" : "text-muted-text"}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Feedback */}
      <section className="py-20 px-6 bg-muted/30 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light border border-primary/20 text-primary text-xs font-bold mb-3">
              <MessageSquarePlus size={12} /> Beta Feedback
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-body">Rate our features honestly</h2>
            <p className="mt-3 text-secondary-text max-w-xl mx-auto text-sm">
              We read every rating. <strong className="text-body">1</strong> = not useful at all for your prep.{" "}
              <strong className="text-body">10</strong> = you can't imagine studying without it.
              The context under each slider tells you exactly what we mean.
            </p>
          </div>
          <FeedbackSection />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Start your merit journey today</h2>
        <p className="mt-3 text-indigo-200">Free to start. No credit card. Takes 2 minutes.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/signup"><Button size="lg" className="bg-white text-navy hover:bg-white/90 font-bold h-12 px-7">Start for free</Button></Link>
          <Button size="lg" variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white h-12 px-7">Talk to an expert</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F0D2E] text-indigo-200 px-6 py-14">
        <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-8 text-sm">
          <div className="md:col-span-2">
            <MeritusLogo size="sm" theme="dark" />
            <p className="mt-3 text-indigo-300/80 max-w-sm">Merit, Mastered. India's AI-powered competitive exam preparation platform.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><Link to="/mock-tests" className="hover:text-white">Mock Tests</Link></li>
              <li><Link to="/ai-tutor" className="hover:text-white">AI Tutor</Link></li>
              <li><Link to="/institutes" className="hover:text-white">For Institutes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Community</h4>
            <ul className="space-y-2">
              <li><a href="https://t.me/meritusjee" target="_blank" rel="noopener noreferrer" className="hover:text-white">JEE Telegram</a></li>
              <li><a href="https://t.me/meritusneet" target="_blank" rel="noopener noreferrer" className="hover:text-white">NEET Telegram</a></li>
              <li><a href="https://t.me/meritusupsc" target="_blank" rel="noopener noreferrer" className="hover:text-white">UPSC Telegram</a></li>
              <li><Link to="/leaderboard" className="hover:text-white">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:text-white">Refund Policy</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Reach us</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="mailto:hello@meritus.co.in" className="hover:text-white">hello@meritus.co.in</a></li>
              <li><a href="mailto:support@meritus.co.in" className="hover:text-white">support@meritus.co.in</a></li>
              <li><a href="mailto:institutes@meritus.co.in" className="hover:text-white">institutes@meritus.co.in</a></li>
              <li><Link to="/feedback" className="hover:text-white text-gold/80">Give feedback →</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/10 text-xs text-indigo-300/70 flex justify-between">
          <span>© {new Date().getFullYear()} Meritus. All rights reserved.</span>
          <span>Made in India 🇮🇳</span>
        </div>
      </footer>
    </div>
  );
}
