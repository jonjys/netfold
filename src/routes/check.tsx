import { createFileRoute } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/check")({ component: CheckPage });

function CheckPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">Köpläge</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Är utropet vettigt?</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        Skriv prylen och vad de vill ha. Netfold jämför med vad en säljare faktiskt
        får kvar på de ärliga kanalerna.
      </p>
      <div className="mt-6">
        <Extractor defaultMode="buy" />
      </div>
    </Shell>
  );
}
