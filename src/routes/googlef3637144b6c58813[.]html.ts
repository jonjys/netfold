import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/googlef3637144b6c58813.html")({
  server: {
    handlers: {
      GET: () =>
        new Response("google-site-verification: googlef3637144b6c58813.html\n", {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          },
        }),
    },
  },
});
