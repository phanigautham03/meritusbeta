/**
 * FeatureHowTo — reusable "How to use this feature" card shown on feature pages.
 * Also used on the landing page hover overlay.
 */
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  step: string;
  detail?: string;
}

interface Props {
  title: string;
  color?: string; // tailwind bg class for accent
  steps: Step[];
  className?: string;
}

const defaultColor = "bg-primary-light text-primary";

export function FeatureHowTo({ title, color = defaultColor, steps, className }: Props) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-5 shadow-card", className)}>
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle size={16} className="text-primary shrink-0" />
        <h3 className="font-semibold text-body text-sm">How to use {title}</h3>
      </div>
      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="shrink-0 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold mt-0.5">
              {i + 1}
            </span>
            <div>
              <div className="text-sm font-medium text-body">{s.step}</div>
              {s.detail && <div className="text-xs text-secondary-text mt-0.5 leading-relaxed">{s.detail}</div>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
