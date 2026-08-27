import { createFileRoute } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? BRAND.domain;
        const origin = `https://${host.replace(/\/$/, "")}`;
        const body = `User-agent: *
Allow: /
Allow: /market
Allow: /i/
Allow: /check
Disallow: /ops
Disallow: /api/
Disallow: /login
Disallow: /paid
Disallow: /mina-kop

Sitemap: ${origin}/sitemap.xml
`;
        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
