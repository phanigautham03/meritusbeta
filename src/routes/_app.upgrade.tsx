import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/upgrade")({ component: Upgrade });

const plans = [
  { name: "Free", price: 0, current: true, cta: "Current Plan", features: [["3 mock tests / month", true], ["Basic analytics", true], ["ExamMatch AI", true], ["AI Study Planner", false], ["Forget-Meter", false], ["Mentor sessions", false], ["Voice AI tutor", false]] },
  { name: "Pro", price: 499, featured: true, cta: "Upgrade to Pro", features: [["Unlimited mock tests", true], ["Full analytics", true], ["ExamMatch AI", true], ["AI Study Planner", true], ["Forget-Meter", true], ["Rank Predictor", true], ["Mentor sessions", false]] },
  { name: "Power", price: 999, cta: "Get Power", features: [["Everything in Pro", true], ["1-on-1 Mentor sessions", true], ["Voice AI tutor", true], ["Priority support", true], ["Custom study plan", true], ["Early-access features", true], ["Exam-day strategy call", true]] },
];

function Upgrade() {
  const [annual, setAnnual] = useState(true);
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-body">Upgrade your plan</h1>
        <p className="mt-2 text-secondary-text">Unlock unlimited tests, AI insights and mentor access.</p>
        <div className="mt-5 inline-flex items-center gap-3 rounded-full bg-card border border-border p-2 px-4 shadow-card">
          <span className={annual ? "text-secondary-text" : "text-body font-semibold"}>Monthly</span>
          <Switch checked={annual} onCheckedChange={setAnnual} />
          <span className={annual ? "text-body font-semibold" : "text-secondary-text"}>Annual</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-success-light text-success font-bold">Save 30%</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {plans.map((p) => {
          const price = annual ? Math.round(p.price * 12 * 0.7) : p.price;
          return (
            <div key={p.name} className={`relative rounded-xl bg-card p-7 shadow-card border ${p.featured ? "border-primary border-2 shadow-card-hover" : "border-border"}`}>
              {p.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">MOST POPULAR</span>}
              {p.current && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-success text-white text-xs font-bold">YOUR PLAN</span>}
              <h3 className="text-lg font-semibold text-body">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-body">₹{price}</span>
                <span className="text-secondary-text text-sm">{p.price === 0 ? "forever" : annual ? "/year" : "/month"}</span>
              </div>
              <Button className={`mt-6 w-full ${p.featured ? "" : p.current ? "bg-muted text-secondary-text hover:bg-muted" : "bg-card border border-primary text-primary hover:bg-primary-light"}`} disabled={p.current}>
                {p.cta}
              </Button>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map(([f, on]) => (
                  <li key={String(f)} className="flex items-start gap-2">
                    {on ? <Check size={16} className="text-success mt-0.5 shrink-0" /> : <X size={16} className="text-muted-text mt-0.5 shrink-0" />}
                    <span className={on ? "text-body" : "text-muted-text"}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

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
                ["Analytics depth", "Basic", "Full", "Full + Custom"],
                ["AI Study Planner", "—", "✓", "✓"],
                ["Forget-Meter", "—", "✓", "✓"],
                ["Rank Predictor", "—", "✓", "✓"],
                ["Voice AI Tutor", "—", "—", "✓"],
                ["Mentor sessions", "—", "—", "Included"],
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
    </div>
  );
}
