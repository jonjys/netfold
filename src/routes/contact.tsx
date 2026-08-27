import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal";

export const Route = createFileRoute("/contact")({
  component: () => (
    <LegalPage title="Kontakt">
      <p>
        Netfold är automatiserat. Betalningsfrågor går via Stripe-kvittot.
        Produktfrågor: öppna din scan-länk. Om åtkomsten inte låstes upp efter
        lyckad betalning — spara kvittot. Leveransen är knuten till Stripe-sessionen.
      </p>
      <p>
        Juridiska meddelanden: operatören är GitHub-kontot som publicerar
        repot <span className="text-fg">jonjys/netfold</span>.
      </p>
      <p>Det finns ingen chattkö. Det är poängen.</p>
    </LegalPage>
  ),
});
