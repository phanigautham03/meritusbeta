// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    build: {
      // Raise warning threshold slightly — 607KB vendor chunk is expected for React + TanStack
      chunkSizeWarningLimit: 650,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // ── Vendor chunk strategy ────────────────────────────────────────
            // 1. React core — loaded first, cached longest
            if (id.includes("node_modules/react/") ||
                id.includes("node_modules/react-dom/") ||
                id.includes("node_modules/scheduler/")) {
              return "vendor-react";
            }
            // 2. TanStack ecosystem
            if (id.includes("node_modules/@tanstack/")) {
              return "vendor-tanstack";
            }
            // 3. Radix UI (shadcn primitives) — large but stable
            if (id.includes("node_modules/@radix-ui/")) {
              return "vendor-radix";
            }
            // 4. Recharts (only used in a few pages) — split away from critical path
            if (id.includes("node_modules/recharts") ||
                id.includes("node_modules/d3-") ||
                id.includes("node_modules/victory-")) {
              return "vendor-charts";
            }
            // 5. Supabase client
            if (id.includes("node_modules/@supabase/")) {
              return "vendor-supabase";
            }
            // 6. Everything else in node_modules → vendor-misc
            if (id.includes("node_modules/")) {
              return "vendor-misc";
            }
          },
        },
      },
    },
  },
});
