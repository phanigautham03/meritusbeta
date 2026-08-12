/**
 * generate-og-image.mjs
 * Generates public/og-image.png (1200×630) using SVG → PNG via @resvg/resvg-js.
 * Run: node scripts/generate-og-image.mjs
 */

import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/og-image.png");

// ── Colour palette (matches Meritus brand) ────────────────────────────────────
const NAVY   = "#1E1B4B";
const INDIGO = "#4338CA";
const INDIGO2= "#6366F1";
const GOLD   = "#D97706";
const WHITE  = "#FFFFFF";
const SOFT   = "#E0E7FF"; // indigo-100
const TEAL   = "#0D9488";
const SUCCESS= "#059669";
const LIGHT_BG = "#F5F3FF";

// ── SVG source (1200 × 630) ───────────────────────────────────────────────────
const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630"
     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#13113A"/>
      <stop offset="55%"  stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#2D2867"/>
    </linearGradient>

    <!-- Gold accent gradient for headline -->
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <!-- Logo icon gradient -->
    <linearGradient id="logoGrad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#1E1B4B"/>
      <stop offset="55%"  stop-color="#3730A3"/>
      <stop offset="100%" stop-color="#4338CA"/>
    </linearGradient>
    <clipPath id="logoClip">
      <rect width="56" height="56" rx="14"/>
    </clipPath>

    <!-- Pill gradient -->
    <linearGradient id="pillGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${INDIGO}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${INDIGO2}" stop-opacity="0.2"/>
    </linearGradient>

    <!-- Card clip path -->
    <clipPath id="cardClip">
      <rect x="850" y="72" width="308" height="380" rx="18"/>
    </clipPath>

    <!-- Score ring track gradient -->
    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${INDIGO}"/>
      <stop offset="100%" stop-color="${INDIGO2}"/>
    </linearGradient>
  </defs>

  <!-- ── Background ─────────────────────────────────────────────────────────── -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Dot grid overlay -->
  <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
    <circle cx="1" cy="1" r="1" fill="${WHITE}" fill-opacity="0.04"/>
  </pattern>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <!-- Subtle background glow behind card area -->
  <ellipse cx="1005" cy="265" rx="210" ry="210" fill="${INDIGO}" fill-opacity="0.10"/>

  <!-- Bottom-left ambient circle -->
  <circle cx="180" cy="560" r="180" fill="${INDIGO}" fill-opacity="0.05"/>

  <!-- Left accent bar -->
  <rect x="72" y="80" width="5" height="470" rx="3" fill="url(#goldGrad)" opacity="0.7"/>

  <!-- ── Logo area (top-left) ───────────────────────────────────────────────── -->
  <!-- Glow behind logo icon -->
  <ellipse cx="139" cy="119" rx="45" ry="45" fill="${INDIGO}" fill-opacity="0.3"/>

  <!-- Logo icon: rounded square -->
  <g transform="translate(111, 91)">
    <rect width="56" height="56" rx="14" fill="url(#logoGrad)"/>
    <g clip-path="url(#logoClip)">
      <!-- Subtle top highlight -->
      <ellipse cx="28" cy="3" rx="24" ry="8" fill="white" fill-opacity="0.06"/>
      <!-- Gold 4-point star -->
      <path d="M28 5.5 L29.9 10 L35.5 11.8 L29.9 13.6 L28 18 L26.1 13.6 L20.5 11.8 L26.1 10 Z"
            fill="${GOLD}"/>
      <!-- White star specular -->
      <circle cx="27.2" cy="10.8" r="1.4" fill="white" fill-opacity="0.38"/>
      <!-- M letterform -->
      <path d="M10 47 L10 22 L28 35 L46 22 L46 47"
            stroke="white" stroke-width="5.5" stroke-linecap="round"
            stroke-linejoin="round" fill="none"/>
      <!-- Gold peak dots -->
      <circle cx="10" cy="22" r="3.3" fill="${GOLD}" fill-opacity="0.5"/>
      <circle cx="46" cy="22" r="3.3" fill="${GOLD}" fill-opacity="0.5"/>
    </g>
  </g>

  <!-- Wordmark -->
  <text x="178" y="124" font-family="Georgia, serif" font-weight="700"
        font-size="34" fill="${WHITE}" letter-spacing="-0.5">Meritus</text>
  <!-- Tagline -->
  <text x="178" y="146" font-family="Arial, sans-serif" font-size="12"
        fill="${SOFT}" opacity="0.7" letter-spacing="2.5">MERIT, MASTERED.</text>

  <!-- ── Main headline ─────────────────────────────────────────────────────── -->
  <text x="112" y="260" font-family="Georgia, serif" font-weight="700"
        font-size="62" fill="${WHITE}" letter-spacing="-1.5">AI-Powered Exam</text>
  <text x="112" y="335" font-family="Georgia, serif" font-weight="700"
        font-size="62" fill="${WHITE}" letter-spacing="-1.5">Prep for India.</text>

  <!-- Gold underline accent under "India." -->
  <rect x="112" y="348" width="310" height="5" rx="2.5" fill="url(#goldGrad)" opacity="0.85"/>

  <!-- ── Sub-headline ───────────────────────────────────────────────────────── -->
  <text x="112" y="405" font-family="Arial, sans-serif" font-size="22"
        fill="${SOFT}" opacity="0.85" letter-spacing="0.2">
    JEE · NEET · UPSC · GATE · CAT · Banking · SSC · 200+ exams
  </text>

  <!-- ── Feature pills ─────────────────────────────────────────────────────── -->
  <!-- Pill 1: Forget-Meter -->
  <rect x="112" y="440" width="196" height="40" rx="20" fill="url(#pillGrad)" stroke="${INDIGO2}" stroke-width="1" stroke-opacity="0.5"/>
  <text x="210" y="466" font-family="Arial, sans-serif" font-size="15"
        fill="${WHITE}" text-anchor="middle" opacity="0.95">Forget-Meter AI</text>

  <!-- Pill 2: Mock Tests -->
  <rect x="320" y="440" width="180" height="40" rx="20" fill="url(#pillGrad)" stroke="${INDIGO2}" stroke-width="1" stroke-opacity="0.5"/>
  <text x="410" y="466" font-family="Arial, sans-serif" font-size="15"
        fill="${WHITE}" text-anchor="middle" opacity="0.95">NTA Simulator</text>

  <!-- Pill 3: AI Tutor -->
  <rect x="512" y="440" width="150" height="40" rx="20" fill="url(#pillGrad)" stroke="${INDIGO2}" stroke-width="1" stroke-opacity="0.5"/>
  <text x="587" y="466" font-family="Arial, sans-serif" font-size="15"
        fill="${WHITE}" text-anchor="middle" opacity="0.95">AI Tutor</text>

  <!-- Pill 4: Study Planner -->
  <rect x="674" y="440" width="170" height="40" rx="20" fill="url(#pillGrad)" stroke="${INDIGO2}" stroke-width="1" stroke-opacity="0.5"/>
  <text x="759" y="466" font-family="Arial, sans-serif" font-size="15"
        fill="${WHITE}" text-anchor="middle" opacity="0.95">Study Planner</text>

  <!-- ── Dashboard Preview Card (replaces stars) ───────────────────────────── -->
  <!-- Card drop shadow -->
  <rect x="856" y="80" width="308" height="380" rx="18"
        fill="black" fill-opacity="0.45"/>

  <!-- Card body -->
  <rect x="850" y="72" width="308" height="380" rx="18" fill="white"/>

  <!-- Card header (navy bar) -->
  <rect x="850" y="72" width="308" height="48" rx="18" fill="${NAVY}"/>
  <rect x="850" y="96" width="308" height="24" fill="${NAVY}"/>

  <!-- macOS-style traffic lights -->
  <circle cx="876" cy="97" r="5" fill="#FF5F57"/>
  <circle cx="895" cy="97" r="5" fill="#FFBD2E"/>
  <circle cx="914" cy="97" r="5" fill="#28CA41"/>

  <!-- Header label -->
  <text x="932" y="102" font-family="Arial, sans-serif" font-size="12"
        fill="rgba(255,255,255,0.80)" font-weight="600" letter-spacing="0.3">Meritus Dashboard</text>

  <!-- ── Score ring ── -->
  <!-- Ring background track -->
  <circle cx="1004" cy="210" r="58" fill="none" stroke="#E5E7EB" stroke-width="10"/>

  <!-- Ring progress arc (87%) — circumference = 2*pi*58 ≈ 364.4, 87% ≈ 317 -->
  <!-- stroke-dashoffset rotates start to top (-90°): dashoffset = 91 -->
  <circle cx="1004" cy="210" r="58"
          fill="none"
          stroke="${INDIGO}"
          stroke-width="10"
          stroke-dasharray="317 47"
          stroke-dashoffset="91"
          stroke-linecap="round"/>

  <!-- Inner score label -->
  <text x="1004" y="203" font-family="Georgia, serif" font-size="28" font-weight="700"
        fill="${NAVY}" text-anchor="middle">87%</text>
  <text x="1004" y="222" font-family="Arial, sans-serif" font-size="11"
        fill="#9CA3AF" text-anchor="middle">Overall Score</text>

  <!-- "PERFORMANCE" sub-label -->
  <text x="1004" y="292" font-family="Arial, sans-serif" font-size="9" font-weight="700"
        fill="#9CA3AF" text-anchor="middle" letter-spacing="1.8">PERFORMANCE</text>

  <!-- ── 3 stat chips ── -->
  <!-- JEE AIR -->
  <rect x="862" y="302" width="85" height="62" rx="12" fill="${LIGHT_BG}"/>
  <text x="904" y="325" font-family="Arial, sans-serif" font-size="15" font-weight="700"
        fill="${INDIGO}" text-anchor="middle">AIR 287</text>
  <text x="904" y="343" font-family="Arial, sans-serif" font-size="9"
        fill="#9CA3AF" text-anchor="middle">JEE Advanced</text>

  <!-- NEET Score -->
  <rect x="958" y="302" width="85" height="62" rx="12" fill="#F0FDF4"/>
  <text x="1000" y="325" font-family="Arial, sans-serif" font-size="15" font-weight="700"
        fill="${SUCCESS}" text-anchor="middle">681/720</text>
  <text x="1000" y="343" font-family="Arial, sans-serif" font-size="9"
        fill="#9CA3AF" text-anchor="middle">NEET Score</text>

  <!-- Streak -->
  <rect x="1054" y="302" width="85" height="62" rx="12" fill="#FFFBEB"/>
  <text x="1096" y="325" font-family="Arial, sans-serif" font-size="15" font-weight="700"
        fill="${GOLD}" text-anchor="middle">14 Days</text>
  <text x="1096" y="343" font-family="Arial, sans-serif" font-size="9"
        fill="#9CA3AF" text-anchor="middle">Study Streak</text>

  <!-- ── Forget-Meter bars ── -->
  <text x="862" y="390" font-family="Arial, sans-serif" font-size="11" font-weight="600"
        fill="${NAVY}">Forget-Meter</text>

  <!-- Bar 1: Thermodynamics 82% -->
  <text x="862" y="407" font-family="Arial, sans-serif" font-size="9" fill="#9CA3AF">Thermodynamics</text>
  <rect x="862" y="411" width="240" height="6" rx="3" fill="#E5E7EB"/>
  <rect x="862" y="411" width="197" height="6" rx="3" fill="${INDIGO}"/>
  <text x="1107" y="417" font-family="Arial, sans-serif" font-size="9" fill="${INDIGO}" text-anchor="end">82%</text>

  <!-- Bar 2: Organic Chemistry 48% — warn color -->
  <text x="862" y="431" font-family="Arial, sans-serif" font-size="9" fill="#9CA3AF">Organic Chemistry</text>
  <rect x="862" y="435" width="240" height="6" rx="3" fill="#E5E7EB"/>
  <rect x="862" y="435" width="115" height="6" rx="3" fill="${GOLD}"/>
  <text x="1107" y="441" font-family="Arial, sans-serif" font-size="9" fill="${GOLD}" text-anchor="end">48%</text>

  <!-- ── CTA badge (bottom-right) ───────────────────────────────────────────── -->
  <rect x="912" y="490" width="220" height="64" rx="14"
        fill="${INDIGO}" fill-opacity="0.9"/>
  <text x="1022" y="518" font-family="Arial, sans-serif" font-weight="700"
        font-size="15" fill="${WHITE}" text-anchor="middle">Free to start</text>
  <text x="1022" y="540" font-family="Arial, sans-serif" font-size="13"
        fill="${SOFT}" text-anchor="middle" opacity="0.8">meritus.co.in</text>

  <!-- ── Bottom bar ─────────────────────────────────────────────────────────── -->
  <rect x="0" y="600" width="1200" height="30" fill="${INDIGO}" fill-opacity="0.25"/>
  <text x="112" y="620" font-family="Arial, sans-serif" font-size="13"
        fill="${SOFT}" opacity="0.6">India's first AI-powered all-exam platform</text>
  <text x="1088" y="620" font-family="Arial, sans-serif" font-size="13"
        fill="${SOFT}" opacity="0.6" text-anchor="end">Made in India</text>
</svg>
`.trim();

// ── Convert SVG → PNG ─────────────────────────────────────────────────────────
console.log("Generating OG image (1200×630)…");

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: { loadSystemFonts: true },
});

const pngBuffer = resvg.render().asPng();
mkdirSync(resolve(__dirname, "../public"), { recursive: true });
writeFileSync(OUT, pngBuffer);

console.log(`✅  Written → ${OUT}  (${(pngBuffer.length / 1024).toFixed(1)} KB)`);
