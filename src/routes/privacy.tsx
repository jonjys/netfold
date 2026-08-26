import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <LegalPage title="Integritet">
      <p>
        Netfold samlar in så lite som möjligt. Om du loggar in sparar vi e-post,
        namn och en Stripe-kund-id så dina köp följer kontot. Utan konto ligger
        bara en slumpmässig plånbokstoken i webbläsaren.
      </p>
      <p>
        Cookies: <code>netfold_consent</code> (accepted/declined) minns ditt val.
        Inloggning och Stripe får inte köras förrän du trycker OK. Nödvändiga
        sessionscookies sätts vid inloggning. Vi säljer ingen data.
      </p>
      <p>
        Foton skickas till xAI för identifiering och kastas sedan. Fotografera
        inte ansikten, id-handlingar eller något du inte vill ska behandlas.
      </p>
      <p>
        Stripe tar emot det de behöver för betalning. Deras integritetspolicy
        gäller den transaktionen. Kortnummer lagras inte hos oss.
      </p>
    </LegalPage>
  ),
});
