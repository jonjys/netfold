import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  component: function Terms() {
    const { t } = useI18n();
    return (
      <LegalPage title={t("termsTitle")}>
        <p>{t("terms1")}</p>
        <p>{t("terms2")}</p>
        <p>{t("terms3")}</p>
        <p>{t("terms4")}</p>
      </LegalPage>
    );
  },
});
