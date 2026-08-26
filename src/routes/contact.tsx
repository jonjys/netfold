import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal";

export const Route = createFileRoute("/contact")({
  component: () => (
    <LegalPage title="Contact">
      <p>
        Netfold is automated. Payment issues go through the Stripe receipt. Product
        issues: reopen your scan link. If access did not unlock after a successful
        payment, keep the receipt — fulfilment is keyed to the Stripe session.
      </p>
      <p>
        Legal notices: the operator of this software is the GitHub account that
        publishes the repository <span className="text-fg">jonjys/netfold</span>.
      </p>
      <p>There is no chat queue. That is the point.</p>
    </LegalPage>
  ),
});
