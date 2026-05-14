import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const examPills = ["JEE Main", "NEET UG", "UPSC", "GATE", "CAT", "SSC CGL"];

export function AuthSplit({
  title, subtitle, bullets, children,
}: {
  title: string; subtitle: string; bullets: string[]; children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex relative w-1/2 bg-navy text-white flex-col p-12 overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-50" />
        {examPills.map((p, i) => (
          <span
            key={p}
            className="absolute text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-indigo-100"
            style={{
              top: `${10 + i * 13}%`,
              right: `${5 + (i % 3) * 8}%`,
              animation: `float ${5 + (i % 3)}s ease-in-out ${i * 0.5}s infinite`,
            }}
          >
            {p}
          </span>
        ))}
        <Link to="/" className="relative flex items-center gap-2 z-10">
          <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center font-bold text-white">M</div>
          <span className="font-bold text-lg">Meritus</span>
        </Link>
        <div className="relative my-auto z-10 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-indigo-200 text-lg">{subtitle}</p>
          <ul className="mt-8 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-indigo-100">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-emerald-400" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-indigo-300 z-10">© 2025 Meritus. Merit, Mastered.</p>
      </aside>
      <div className="flex-1 flex items-center justify-center p-6 bg-card">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
