import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal";

export const Route = createFileRoute("/terms")({
  component: () => (
    <LegalPage title="Villkor">
      <p>
        Netfold är programvara som uppskattar vad du får kvar när du säljer
        begagnat, och säljer digitala rapporter och annonskit. Vi är inte en
        marknadsplats, mäklare, pantbank eller köpare av dina prylar. Vi tar inte
        hand om varor och vi håller inte köparens pengar.
      </p>
      <p>
        Uppskattningarna bygger på en katalog, publicerade avgifter och (om du
        laddar upp foto) en identifieringsmodell. Det är inte värderingar,
        garantier eller bud. Sålda priser rör sig. Skick är en gissning.
      </p>
      <p>
        Betalning tas av Stripe. Du får en digital upplåsning mot scan-token.
        Chargeback kan låsa igen. Ladda inte upp foton på andra personer, olagliga
        varor eller något du inte har rätt att behandla.
      </p>
      <p>Svensk och EU-konsumenträtt gäller där den måste. Tillämplig lag: Sverige.</p>
    </LegalPage>
  ),
});
