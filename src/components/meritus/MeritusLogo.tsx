/**
 * MeritusLogo — the official brand mark for Meritus.
 *
 * Variants:
 *   "icon"   — square icon only (use when collapsed / small spaces)
 *   "full"   — icon + wordmark side by side (default)
 *   "stacked"— icon above wordmark (use in hero / splash screens)
 *
 * Themes:
 *   "dark"   — white wordmark (use on navy / dark backgrounds)
 *   "light"  — navy wordmark (use on white / light backgrounds)
 *
 * Sizes: xs | sm | md | lg | xl
 */

import { cn } from "@/lib/utils";

type LogoVariant = "icon" | "full" | "stacked";
type LogoTheme = "dark" | "light";
type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface MeritusLogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  size?: LogoSize;
  showTagline?: boolean;
  className?: string;
}

const sizeMap: Record<
  LogoSize,
  { icon: number; name: string; tagline: string; gap: string }
> = {
  xs: { icon: 24, name: "text-sm",   tagline: "text-[8px]",  gap: "gap-1.5" },
  sm: { icon: 32, name: "text-base", tagline: "text-[9px]",  gap: "gap-2"   },
  md: { icon: 40, name: "text-xl",   tagline: "text-[10px]", gap: "gap-2.5" },
  lg: { icon: 52, name: "text-2xl",  tagline: "text-xs",     gap: "gap-3"   },
  xl: { icon: 68, name: "text-3xl",  tagline: "text-sm",     gap: "gap-4"   },
};

export function MeritusLogo({
  variant = "full",
  theme = "dark",
  size = "md",
  showTagline = false,
  className,
}: MeritusLogoProps) {
  const s = sizeMap[size];
  const nameColor  = theme === "dark" ? "text-white"         : "text-[#1E1B4B]";
  const tagColor   = theme === "dark" ? "text-indigo-200"    : "text-[#6366F1]";

  const icon = <MeritusIcon size={s.icon} />;

  if (variant === "icon") {
    return <div className={className}>{icon}</div>;
  }

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        {icon}
        <div className="text-center leading-tight">
          <p className={cn("font-extrabold tracking-tight", s.name, nameColor)}>
            Meritus
          </p>
          {showTagline && (
            <p className={cn("uppercase tracking-[0.16em] font-semibold mt-0.5", s.tagline, tagColor)}>
              Merit, Mastered.
            </p>
          )}
        </div>
      </div>
    );
  }

  // "full" — default horizontal layout
  return (
    <div className={cn("flex items-center", s.gap, className)}>
      {icon}
      <div className="flex flex-col leading-none">
        <span className={cn("font-extrabold tracking-tight leading-none", s.name, nameColor)}>
          Meritus
        </span>
        {showTagline && (
          <span className={cn("uppercase tracking-[0.15em] font-semibold mt-0.5", s.tagline, tagColor)}>
            Merit, Mastered.
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * MeritusIcon — the standalone icon mark.
 *
 * Design:
 *   • Rounded-square badge with a deep-navy → indigo gradient.
 *   • A gold 4-pointed sparkle (✦) sits at the top, representing merit & achievement.
 *   • A white M letterform beneath — two peaks like mountain summits,
 *     symbolising the climb to mastery.
 *   • Paths are clipped to the rounded background for a clean finish.
 */
export function MeritusIcon({ size = 40, className }: { size?: number; className?: string }) {
  // Use stable IDs — all instances share the same gradient/clip (identical shapes).
  const gId = "m-logo-grad";
  const cId = "m-logo-clip";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Meritus logo"
      className={cn("shrink-0", className)}
    >
      <defs>
        {/* Deep navy → royal indigo gradient (top-left to bottom-right) */}
        <linearGradient id={gId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1E1B4B" />
          <stop offset="55%"  stopColor="#3730A3" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>

        {/* Clip path matches the background rounded square */}
        <clipPath id={cId}>
          <rect width="48" height="48" rx="12" />
        </clipPath>
      </defs>

      {/* ── Background ── */}
      <rect width="48" height="48" rx="12" fill={`url(#${gId})`} />

      {/* All inner artwork clipped to the rounded rect */}
      <g clipPath={`url(#${cId})`}>
        {/* Subtle inner top-edge highlight (glass-like sheen) */}
        <ellipse cx="24" cy="2" rx="20" ry="7" fill="white" fillOpacity="0.07" />

        {/* ── Rising Sun ── */}
        {/* Dawn glow ellipse */}
        <ellipse cx="24" cy="14" rx="9" ry="2.5" fill="#D97706" fillOpacity="0.10" />
        {/* Horizon line */}
        <line x1="15" y1="14" x2="33" y2="14" stroke="#D97706" strokeOpacity="0.40" strokeWidth="0.9" strokeLinecap="round" />
        {/* Upper semicircle sun disc */}
        <path d="M18.5 14 A5.5 5.5 0 0 1 29.5 14 Z" fill="#D97706" fillOpacity="0.92" />
        {/* Specular highlight on sun disc */}
        <circle cx="22.2" cy="11.2" r="1.3" fill="white" fillOpacity="0.32" />
        {/* Centre ray */}
        <line x1="24" y1="8.5" x2="24" y2="4.8" stroke="#D97706" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.92" />
        {/* ±20° rays */}
        <line x1="22.1" y1="8.8" x2="20.85" y2="5.4" stroke="#D97706" strokeWidth="1.25" strokeLinecap="round" strokeOpacity="0.85" />
        <line x1="25.9" y1="8.8" x2="27.15" y2="5.4" stroke="#D97706" strokeWidth="1.25" strokeLinecap="round" strokeOpacity="0.85" />
        {/* ±40° rays */}
        <line x1="20.45" y1="9.8" x2="18.1" y2="7.0" stroke="#D97706" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.72" />
        <line x1="27.55" y1="9.8" x2="29.9" y2="7.0" stroke="#D97706" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.72" />
        {/* ±60° rays */}
        <line x1="19.24" y1="11.25" x2="16.0" y2="9.4" stroke="#D97706" strokeWidth="0.95" strokeLinecap="round" strokeOpacity="0.58" />
        <line x1="28.76" y1="11.25" x2="32.0" y2="9.4" stroke="#D97706" strokeWidth="0.95" strokeLinecap="round" strokeOpacity="0.58" />

        {/* ── M letterform ──
          Two-peaked M: left(9,40)→peak(9,19)→valley(24,30)→peak(39,19)→right(39,40)
          The bottom ends at y=40; they clip naturally at the rounded corners,
          giving the M a seamless blended finish.
        */}
        <path
          d="M9 40 L9 19 L24 30 L39 19 L39 40"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Small gold accent dots at the two M peaks — like summit markers */}
        <circle cx="9"  cy="19" r="2.8" fill="#D97706" fillOpacity="0.55" />
        <circle cx="39" cy="19" r="2.8" fill="#D97706" fillOpacity="0.55" />
      </g>
    </svg>
  );
}
