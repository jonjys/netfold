import { createFileRoute } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { Shell } from "@/components/shell";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/check")({ component: CheckPage });

function CheckPage() {
  const { t } = useI18n();
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">{t("checkKicker")}</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">{t("checkTitle")}</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">{t("checkLead")}</p>
      <div className="mt-6">
        <Extractor defaultMode="buy" />
      </div>
    </Shell>
  );
}
