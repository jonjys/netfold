import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  component: function Contact() {
    const { t } = useI18n();
    return (
      <LegalPage title={t("contactTitle")}>
        <p>{t("contact1")}</p>
        <p>{t("contact2")}</p>
        <p>{t("contact3")}</p>
      </LegalPage>
    );
  },
});
