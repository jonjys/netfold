import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal";

export const Route = createFileRoute("/terms")({
  component: () => (
    <LegalPage title="Terms">
      <p>
        Netfold is software that estimates used-goods take-home value and sells
        digital reports and listing kits. We are not a marketplace, broker,
        pawn shop, or buyer of your items. We do not take possession of goods
        and we do not hold buyer funds.
      </p>
      <p>
        Estimates use a public catalog, published marketplace fee schedules, and
        (when you upload a photo) an identification model. They are not appraisals,
        guarantees, or offers to purchase. Sold prices move. Condition is a guess.
      </p>
      <p>
        Payment is charged by Stripe. You receive a digital unlock against the scan
        token. Chargebacks may reverse the unlock. Do not upload photos of other
        people, illegal goods, or anything you do not have the right to process.
      </p>
      <p>Swedish and EU consumer rules apply where they must. Governing law: Sweden.</p>
    </LegalPage>
  ),
});
