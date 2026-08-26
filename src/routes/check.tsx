import { createFileRoute } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/check")({ component: CheckPage });

function CheckPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">Buyer mode</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Is this ask sane?</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        Paste the item and the number they want. Netfold compares it to what a
        seller would actually pocket on the honest channels.
      </p>
      <div className="mt-6">
        <Extractor defaultMode="buy" />
      </div>
    </Shell>
  );
}
