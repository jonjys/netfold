import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  component: function Privacy() {
    const { t } = useI18n();
    return (
      <LegalPage title={t("privacyTitle")}>
        <p>{t("privacy1")}</p>
        <p>{t("privacy2")}</p>
        <p>{t("privacy3")}</p>
        <p>{t("privacy4")}</p>
      </LegalPage>
    );
  },
});
