import { createFileRoute } from "@tanstack/react-router";
import { ScanView } from "@/components/scan-view";
import { Shell } from "@/components/shell";
import { getScan } from "@/lib/server/scan";

export const Route = createFileRoute("/s/$token")({
  loader: async ({ params }) => getScan({ data: { token: params.token } }),
  component: ScanPage,
});

function ScanPage() {
  const data = Route.useLoaderData();
  if (!data.ok) {
    return (
      <Shell>
        <h1 className="font-display text-3xl tracking-tight">Scanen hittades inte</h1>
        <p className="mt-2 text-sm text-muted">Länken är ogiltig eller har gått ut.</p>
      </Shell>
    );
  }
  return (
    <Shell>
      <ScanView view={data.view} />
    </Shell>
  );
}
