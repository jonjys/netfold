import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Shell } from "@/components/shell";
import { formatEuro } from "@/lib/money";
import { SKUS, type SkuId } from "@/lib/skus";
import { listMyPurchases } from "@/lib/server/accounts";

export const Route = createFileRoute("/mina-kop")({ component: MyPurchases });

type Row = {
  id: string;
  sku: string;
  product_id: string;
  scan_token: string | null;
  amount_cents: number;
  status: string;
  created_at: string;
  item_names: string | null;
};

function titleFromTeaser(raw: string | null): string {
  if (!raw) return "Rapport";
  try {
    const parsed = JSON.parse(raw) as { names?: string[] };
    if (parsed.names?.length) return parsed.names.join(", ");
  } catch {
    /* ignore */
  }
  return "Rapport";
}

function MyPurchases() {
  const { user, isPending } = useCurrentUserState();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (!user) return;
    void listMyPurchases()
      .then(setRows)
      .catch(() => setRows([]));
  }, [user]);

  if (isPending) {
    return (
      <Shell>
        <div className="h-10 w-48 animate-pulse rounded-md bg-surface-2" />
      </Shell>
    );
  }
  if (!user) return <Navigate to="/login" search={{ next: "/mina-kop" }} />;

  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.18em] text-subtle">Konto</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Mina rapporter</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        Allt du har låst upp, knutet till {user.primaryEmail ?? user.displayName}.
      </p>

      <ul className="mt-8 divide-y divide-border rounded-2xl bg-surface shadow-[var(--shadow-border)]">
        {(rows ?? []).length === 0 ? (
          <li className="px-4 py-8 text-sm text-muted">
            Inga köp än.{" "}
            <Link to="/" className="underline underline-offset-2">
              Prissätt något
            </Link>
            .
          </li>
        ) : (
          (rows ?? []).map((row) => {
            const sku = row.sku as SkuId;
            return (
              <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div>
                  <p className="text-sm">{titleFromTeaser(row.item_names)}</p>
                  <p className="mt-0.5 text-xs text-subtle">
                    {sku in SKUS ? SKUS[sku].name : row.sku} · {formatEuro(row.amount_cents)}
                  </p>
                </div>
                {row.scan_token ? (
                  <Link
                    to="/s/$token"
                    params={{ token: row.scan_token }}
                    className="text-sm text-muted hover:text-fg"
                  >
                    Öppna
                  </Link>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </Shell>
  );
}
