import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Input } from "@/components/ui/input";
import { formatEuro } from "@/lib/money";
import { getMachine } from "@/lib/server/admin";

export const Route = createFileRoute("/ops")({
  component: OpsPage,
});

function OpsPage() {
  const [key, setKey] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof getMachine>> | null>(null);

  useEffect(() => {
    void getMachine({ data: { key: key || undefined } }).then(setData);
  }, [key]);

  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">Owner only</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Machine</h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Whether money is moving. No customer records on this screen.
      </p>
      <div className="mt-4 max-w-xs">
        <Input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Operator key"
          type="password"
          autoComplete="off"
        />
      </div>

      {!data ? (
        <p className="mt-8 text-sm text-muted">Loading ledger…</p>
      ) : !data.ok ? (
        <p className="mt-8 text-sm text-muted">Locked. Enter the operator key.</p>
      ) : (
        <div className="mt-8 grid gap-4">
          <section>
            <h2 className="text-xs uppercase tracking-[0.16em] text-subtle">Today</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Metric label="Revenue" value={formatEuro(data.today.revenue, true)} />
              <Metric label="Transactions" value={String(data.today.transactions)} />
            </div>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-[0.16em] text-subtle">Last 7 days</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Revenue" value={formatEuro(data.week.revenue, true)} />
              <Metric label="Tx" value={String(data.week.transactions)} />
              <Metric label="Scans" value={String(data.week.scans)} />
              <Metric
                label="Conversion"
                value={`${Math.round(data.week.conversion * 100)}%`}
              />
              <Metric label="AI cost" value={formatEuro(data.week.aiCost, true)} />
              <Metric label="Stripe cost" value={formatEuro(data.week.stripeCost, true)} />
              <Metric label="Gross" value={formatEuro(data.week.gross, true)} />
              <Metric label="Top SKU" value={data.week.topSku} />
            </div>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-[0.16em] text-subtle">System</h2>
            <ul className="mt-3 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
              {Object.entries(data.status).map(([name, value]) => (
                <li key={name} className="flex h-12 items-center justify-between px-4 text-sm">
                  <span className="capitalize">{name}</span>
                  <span className="font-mono text-xs text-muted">
                    {typeof value === "boolean" ? (value ? "up" : "off") : String(value)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-[0.16em] text-subtle">Event log</h2>
            <ul className="mt-3 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
              {data.recent.length === 0 ? (
                <li className="px-4 py-5 text-sm text-muted">No events yet.</li>
              ) : (
                data.recent.map((e, i) => (
                  <li key={i} className="flex h-12 items-center justify-between px-4 text-sm">
                    <span>
                      {e.name}
                      {e.sku ? ` · ${e.sku}` : ""}
                    </span>
                    <span className="font-mono text-xs text-subtle">
                      {formatStamp(e.at)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      )}
    </Shell>
  );
}

function formatStamp(at: string): string {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return at.slice(0, 16);
  return d.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs text-subtle">{label}</p>
      <p className="mt-1 font-mono text-xl tabular-nums">{value}</p>
    </div>
  );
}
