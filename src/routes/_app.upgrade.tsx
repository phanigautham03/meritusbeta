import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Lightbulb, Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/integrations/external-supabase/auth-context";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_app/upgrade")({
  component: Upgrade,
  head: () => ({
    meta: [
      { title: "Plans & Pricing — Meritus" },
      { name: "description", content: "Simple, transparent pricing for Meritus. Choose the plan that fits your exam prep journey." },
      { property: "og:title", content: "Plans & Pricing — Meritus" },
      { property: "og:url", content: "https://meritus.co.in/upgrade" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://meritus.co.in/upgrade" }],
  }),
});

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, annual: 0 },
    priceNote: { monthly: "forever", annual: "forever" },
    features: [
      ["3 mock tests / month", true],
      ["Basic analytics", true],
      ["ExamMatch AI", true],
      ["AI Study Planner", false],
      ["Forget-Meter", false],
      ["Mentor sessions", false],
      ["Voice AI tutor", false],
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 499, annual: 399 },
    priceNote: { monthly: "/month", annual: "/month, billed annually" },
    featured: true,
    features: [
      ["Unlimited mock tests", true],
      ["Full analytics", true],
      ["ExamMatch AI", true],
      ["AI Study Planner", true],
      ["Forget-Meter", true],
      ["Rank Predictor", true],
      ["Mentor sessions", false],
    ],
  },
  {
    id: "power",
    name: "Power",
    price: { monthly: 999, annual: 799 },
    priceNote: { monthly: "/month", annual: "/month, billed annually" },
    features: [
      ["Everything in Pro", true],
      ["1-on-1 Mentor sessions", true],
      ["Voice AI tutor", true],
      ["Priority support", true],
      ["Custom study plan", true],
      ["Early-access features", true],
      ["Exam-day strategy call", true],
    ],
  },
] as const;

function Upgrade() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleBuy(planId: "pro" | "power") {
    if (!user) { toast.error("Please log in first"); return; }
    setLoading(planId);
    try {
      await loadRazorpayScript();

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, billing }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      const { orderId, amount, keyId } = (await res.json()) as { orderId: string; amount: number; keyId: string };

      const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
      const firstName = fullName.split(" ")[0] || "Student";

      await new Promise<void>((resolve, reject) => {
        const rz = new window.Razorpay({
          key: keyId,
          amount,
          currency: "INR",
          name: "Meritus",
          description: `Meritus ${planId === "pro" ? "Pro" : "Power"} — ${billing === "annual" ? "Annual" : "Monthly"}`,
          image: "https://meritus.co.in/icon-192.png",
          order_id: orderId,
          prefill: { name: fullName, email: user.email ?? "" },
          theme: { color: "#4338CA" },
          handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              const vRes = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...resp,
                  plan: planId,
                  billing,
                  userId: user.id,
                  amount,
                }),
              });
              if (!vRes.ok) throw new Error("Verification failed");
              const { plan: newPlan } = (await vRes.json()) as { plan: string };
              qc.invalidateQueries({ queryKey: ["profile"] });
              toast.success(`You're now on Meritus ${newPlan === "power" ? "Power" : "Pro"}! All features unlocked.`, { duration: 6000 });
              resolve();
            } catch (e) {
              toast.error("Payment received but verification failed. Contact support@meritus.co.in with your payment ID.");
              reject(e);
            }
          },
          modal: { ondismiss: () => reject(new Error("dismissed")) },
        });
        rz.open();
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg !== "dismissed") toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling("monthly")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${billing === "monthly" ? "bg-primary text-white border-primary" : "bg-card text-secondary-text border-border"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("annual")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${billing === "annual" ? "bg-primary text-white border-primary" : "bg-card text-secondary-text border-border"}`}
        >
          Annual <span className="ml-1 text-xs text-success font-bold">Save 20%</span>
        </button>
      </div>

      {/* Pricing cards */}
      <div>
        <div className="text-center mb-6">
          <span className="label-caps text-primary">Plans &amp; Pricing</span>
          <h1 className="mt-1 text-2xl font-bold text-body">Simple, transparent pricing</h1>
          <p className="mt-1.5 text-sm text-secondary-text">
            Choose the plan that fits your exam prep journey. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-xl bg-card p-7 shadow-card border ${
                p.featured ? "border-primary border-2 shadow-card-hover" : "border-border"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-lg font-semibold text-body">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-body">
                  {p.price[billing] === 0 ? "Free" : `₹${p.price[billing]}`}
                </span>
                <span className="text-secondary-text text-sm">{p.priceNote[billing]}</span>
              </div>

              {p.id === "free" ? (
                <div className="mt-6 w-full rounded-lg bg-muted px-4 py-2.5 text-center text-sm text-secondary-text font-medium">
                  Current plan
                </div>
              ) : (
                <Button
                  className={`mt-6 w-full font-semibold gap-2 ${p.featured ? "" : "variant-outline border-primary text-primary hover:bg-primary-light"}`}
                  onClick={() => handleBuy(p.id as "pro" | "power")}
                  disabled={!!loading}
                >
                  {loading === p.id ? (
                    <><Loader2 size={14} className="animate-spin" /> Processing…</>
                  ) : (
                    <><Crown size={14} /> Get {p.name}</>
                  )}
                </Button>
              )}

              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map(([f, on]) => (
                  <li key={String(f)} className="flex items-start gap-2">
                    {on
                      ? <Check size={16} className="text-success mt-0.5 shrink-0" />
                      : <X size={16} className="text-muted-text mt-0.5 shrink-0" />
                    }
                    <span className={on ? "text-body" : "text-muted-text"}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Feature comparison */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-body">Compare features</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-3 text-secondary-text label-caps">Feature</th>
                <th className="py-3 text-center text-secondary-text label-caps">Free</th>
                <th className="py-3 text-center text-primary label-caps">Pro</th>
                <th className="py-3 text-center text-secondary-text label-caps">Power</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Mock tests / month", "3", "Unlimited", "Unlimited"],
                ["Analytics depth",    "Basic", "Full", "Full + Custom"],
                ["AI Study Planner",   "—", "✓", "✓"],
                ["Forget-Meter",       "—", "✓", "✓"],
                ["Rank Predictor",     "—", "✓", "✓"],
                ["Voice AI Tutor",     "—", "—", "✓"],
                ["Mentor sessions",    "—", "—", "Included"],
              ].map((row) => (
                <tr key={row[0]}>
                  <td className="py-3 text-body font-medium">{row[0]}</td>
                  <td className="py-3 text-center text-secondary-text">{row[1]}</td>
                  <td className="py-3 text-center text-primary font-semibold">{row[2]}</td>
                  <td className="py-3 text-center text-body">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coming Soon features */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-gold" />
            <h2 className="text-lg font-semibold text-body">Coming Soon</h2>
          </div>
          <Link to="/feedback" className="text-xs text-primary hover:underline flex items-center gap-1">
            <Lightbulb size={12} /> Vote for what gets built first
          </Link>
        </div>
        <p className="text-sm text-secondary-text mb-6">
          Features we're actively building — prioritised by student demand.
          Pro &amp; Power users get early access.{" "}
          <Link to="/feedback" className="text-primary hover:underline font-medium">
            Tell us what you want →
          </Link>
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: "Previous Year Papers (PYQs)",  desc: "Full annotated PYQs for JEE, NEET, UPSC, GATE, CAT — topic-wise filters and AI pattern analysis.", tag: "High Priority" },
            { label: "Chapter / Topic-wise Tests",   desc: "Bite-sized 10–20 question tests by chapter. Drill one topic at a time.", tag: "High Priority" },
            { label: "Android Mobile App",           desc: "Native app with offline quiz support and Forget-Meter push notifications.", tag: "High Priority" },
            { label: "Bookmark Questions",           desc: "Save any MCQ during a quiz and revisit them in a dedicated Bookmarks module.", tag: "High Priority" },
            { label: "Wrong Answers Module",         desc: "One-click replay of every question you got wrong — like Marrow's Magic Module but for all exams.", tag: "High Priority" },
            { label: "Weakness Heatmap",             desc: "Visual subject-wise grid showing your performance across topics.", tag: "High Priority" },
            { label: "Formula Sheets & Mind Maps",   desc: "One-page quick-revision sheets for every subject.", tag: "Medium" },
            { label: "Current Affairs Digest",       desc: "Daily current affairs for UPSC/Banking/SSC — summarised, tagged by topic.", tag: "Medium" },
            { label: "Score Trend Chart",            desc: "Line graph of your last 10 test scores on the Dashboard and Results page.", tag: "Medium" },
            { label: "Custom Quiz Builder",          desc: "Pick exam, subject, difficulty, and question count — generate a tailored quiz.", tag: "Medium" },
            { label: "Time-per-Question Tracking",   desc: "See how long you spend on each question and identify your slowest topics.", tag: "Medium" },
            { label: "Pan-India Percentile",         desc: "\"You scored better than X% of students\" — calculated live across all attempts.", tag: "Medium" },
            { label: "AI Topic Summaries",           desc: "Claude-generated bullet-point notes for every study topic.", tag: "Medium" },
            { label: "Last-Minute Revision Mode",    desc: "High-yield one-liners for exam eve, organised by subject and exam.", tag: "Medium" },
            { label: "Performance Analytics",        desc: "Detailed charts showing accuracy, average time, and improvement trend per subject.", tag: "Medium" },
            { label: "Voice AI Study Mode",          desc: "Listen to AI-narrated explanations while commuting. Study without a screen.", tag: "Later" },
            { label: "Discussion Threads",           desc: "Comment on any MCQ — discuss doubts with the Meritus community.", tag: "Later" },
            { label: "Grand Test Series",            desc: "Pan-India timed tests with live percentile ranking among all participants.", tag: "Later" },
            { label: "Offline Mode",                 desc: "PWA caching so your quizzes and notes work without internet.", tag: "Later" },
            { label: "Regional Language UI",         desc: "Hindi, Tamil, Telugu, Kannada interface for mother-tongue learners.", tag: "Later" },
          ].map(({ label, desc, tag }) => {
            const tagColor =
              tag === "High Priority" ? "bg-danger/10 text-danger"
              : tag === "Medium"       ? "bg-gold/10 text-gold"
              : "bg-muted text-secondary-text";
            return (
              <div
                key={label}
                className="rounded-lg border border-border p-4 flex flex-col gap-2 hover:border-primary/40 hover:bg-primary-light/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-sm text-body leading-snug">{label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${tagColor}`}>{tag}</span>
                </div>
                <p className="text-xs text-secondary-text leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary-light/30 rounded-lg px-4 py-3">
          <div>
            <div className="font-semibold text-sm text-body">Don't see what you need?</div>
            <div className="text-xs text-secondary-text mt-0.5">Tell us — the most-requested features get built first.</div>
          </div>
          <Link to="/feedback">
            <Button size="sm" className="gap-1.5 shrink-0">
              <Lightbulb size={14} /> Request a feature
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
}
