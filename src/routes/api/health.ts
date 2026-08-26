import { createFileRoute } from "@tanstack/react-router";
import { healthPayload } from "@/lib/server/public";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const body = await healthPayload();
        return Response.json(body, { status: body.ok ? 200 : 503 });
      },
    },
  },
});
