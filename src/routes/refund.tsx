import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal";

export const Route = createFileRoute("/refund")({
  component: () => (
    <LegalPage title="Återköp">
      <p>
        Rapporter och extract-kit är digitala och levereras direkt. Om upplåsningen
        inte syns: öppna samma scan-länk eller kontakta oss via kvittot — då
        återställer vi åtkomsten. Det är en leveransreparation, inte en
        kvalitetsreklamation.
      </p>
      <p>
        Siffrorna syns i samma ögonblick du betalar. Vi återbetalar inte bara för
        att du tycker att priset är fel. Om identifieringen uppenbart är fel (fel
        modell) kan du begära återköp inom 24 timmar och skicka med scan-länken.
      </p>
      <p>
        Ångerrätten för digitalt innehåll i EU upphör när leveransen börjar, efter
        att du informerats om det.
      </p>
    </LegalPage>
  ),
});
