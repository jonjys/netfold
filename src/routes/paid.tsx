import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { confirmSession } from "@/lib/server/stripe";

type PaidSearch = {
  session_id?: string;
  preview?: string;
  sku?: string;
  token?: string;
};

export const Route = createFileRoute("/paid")({
  validateSearch: (search: Record<string, unknown>): PaidSearch => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
    preview: typeof search.preview === "string" ? search.preview : undefined,
    sku: typeof search.sku === "string" ? search.sku : undefined,
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: PaidPage,
});

function PaidPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [state, setState] = useState<"working" | "ok" | "fail">("working");

  useEffect(() => {
    let cancelled = false;
    void confirmSession({
      data: {
        sessionId: search.session_id,
        preview: search.preview === "1",
        sku: search.sku as "report" | "extract" | "pack" | undefined,
        token: search.token,
      },
    })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setState("fail");
          return;
        }
        setState("ok");
        if (res.token) {
          await navigate({ to: "/s/$token", params: { token: res.token } });
        }
      })
      .catch(() => {
        if (!cancelled) setState("fail");
      });
    return () => {
      cancelled = true;
    };
  }, [search.session_id, search.preview, search.sku, search.token, navigate]);

  return (
    <Shell>
      <h1 className="font-display text-3xl tracking-tight">
        {state === "working" && "Bekräftar betalning"}
        {state === "ok" && "Upplåst"}
        {state === "fail" && "Betalningen bekräftades inte"}
      </h1>
      <p className="mt-3 text-sm text-muted">
        {state === "working" && "Vi lägger kvittot i rapporten."}
        {state === "ok" && "Rapporten är öppen. Sparad under Mina rapporter."}
        {state === "fail" && "Om du debiterades låser webhooken upp scannen. Uppdatera om en stund."}
      </p>
      {search.token && (
        <p className="mt-6">
          <Link to="/s/$token" params={{ token: search.token }} className="text-sm underline">
            Öppna rapporten
          </Link>
        </p>
      )}
    </Shell>
  );
}
