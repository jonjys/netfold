import { createFileRoute } from "@tanstack/react-router";
import { CATALOG } from "@/lib/catalog";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? BRAND.domain;
        const origin = `https://${host.replace(/\/$/, "")}`;
        const today = new Date().toISOString().slice(0, 10);
        const urls = [
          { loc: `${origin}/`, priority: "1.0" },
          { loc: `${origin}/market`, priority: "0.9" },
          { loc: `${origin}/iphone-varde`, priority: "0.9" },
          { loc: `${origin}/swappie-vs-blocket`, priority: "0.9" },
          { loc: `${origin}/b/demo`, priority: "0.8" },
          { loc: `${origin}/check`, priority: "0.7" },
          ...CATALOG.map((item) => ({
            loc: `${origin}/i/${item.slug}`,
            priority: "0.8",
          })),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
