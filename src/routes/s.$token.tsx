import { createFileRoute } from "@tanstack/react-router";
import { ScanView } from "@/components/scan-view";
import { Shell } from "@/components/shell";
import { getScan } from "@/lib/server/scan";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/s/$token")({
  loader: async ({ params }) => getScan({ data: { token: params.token } }),
  component: ScanPage,
});

function ScanPage() {
  const data = Route.useLoaderData();
  const { t } = useI18n();
  if (!data.ok) {
    return (
      <Shell>
        <h1 className="font-display text-3xl tracking-tight">{t("scanMissing")}</h1>
        <p className="mt-2 text-sm text-muted">{t("scanMissingLead")}</p>
      </Shell>
    );
  }
  return (
    <Shell>
      <ScanView view={data.view} />
    </Shell>
  );
}
