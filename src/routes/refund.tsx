import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/refund")({
  component: function Refund() {
    const { t } = useI18n();
    return (
      <LegalPage title={t("refundTitle")}>
        <p>{t("refund1")}</p>
        <p>{t("refund2")}</p>
        <p>{t("refund3")}</p>
      </LegalPage>
    );
  },
});
