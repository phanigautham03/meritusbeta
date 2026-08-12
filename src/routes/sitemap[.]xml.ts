import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://meritus.co.in";
const TODAY = new Date().toISOString().split("T")[0];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          // Core public pages
          { path: "/",           changefreq: "weekly",  priority: "1.0", lastmod: TODAY },
          { path: "/institutes", changefreq: "weekly",  priority: "0.8", lastmod: TODAY },
          { path: "/about",      changefreq: "monthly", priority: "0.7", lastmod: TODAY },
          { path: "/contact",    changefreq: "monthly", priority: "0.6", lastmod: TODAY },
          { path: "/feedback",   changefreq: "monthly", priority: "0.5", lastmod: TODAY },
          { path: "/signup",     changefreq: "monthly", priority: "0.6", lastmod: TODAY },
          // Legal pages (trust signals for Google)
          { path: "/privacy",    changefreq: "yearly",  priority: "0.4", lastmod: TODAY },
          { path: "/terms",      changefreq: "yearly",  priority: "0.4", lastmod: TODAY },
          { path: "/refund",     changefreq: "yearly",  priority: "0.3", lastmod: TODAY },
        ];

        const urls = entries
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
