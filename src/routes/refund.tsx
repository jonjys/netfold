import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal";

export const Route = createFileRoute("/refund")({
  component: () => (
    <LegalPage title="Refunds">
      <p>
        Reports and extract kits are digital and delivered immediately. If the unlock
        did not appear, open the original scan link or contact us from the receipt —
        we will restore access. That is not a product-quality dispute; it is a
        fulfilment repair.
      </p>
      <p>
        Because the numbers and copy are visible the moment you pay, we do not refund
        simply because you disagree with a price. If identification is obviously wrong
        (the model is not the item), ask for a refund within 24 hours and include the
        scan link.
      </p>
      <p>EU withdrawal rights for digital content end when delivery starts, after you are told that.</p>
    </LegalPage>
  ),
});
