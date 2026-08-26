import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <LegalPage title="Privacy">
      <p>
        Netfold is built to collect almost nothing. A random wallet token lives in
        your browser. Scans store item names, prices, and an optional photo hash —
        not your name. We do not keep card numbers; Stripe does.
      </p>
      <p>
        Photos are sent to xAI for identification, then discarded from our servers.
        Do not photograph faces, documents, or anything you would not want processed.
      </p>
      <p>
        Stripe receives whatever they need to take payment. If you pay, their privacy
        policy applies to that transaction. We do not sell personal data. There is
        usually none to sell.
      </p>
      <p>
        Operator metrics on /ops are aggregates: revenue, counts, system status. They
        are not a customer list.
      </p>
    </LegalPage>
  ),
});
