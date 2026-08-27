import { useNavigate } from "@tanstack/react-router";
import { Camera, Search, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compressImage } from "@/lib/image";
import { type Condition } from "@/lib/pricing";
import { createScan, searchItems } from "@/lib/server/scan";
import { getWalletToken } from "@/lib/wallet-client";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { CopyKey } from "@/lib/copy";

const QUICK = [
  { id: "sony-xm5", label: "Sony XM5" },
  { id: "iphone-13-128", label: "iPhone 13" },
  { id: "ps5-slim", label: "PS5 Slim" },
  { id: "dyson-v15", label: "Dyson V15" },
];

export function Extractor({
  defaultMode = "sell",
}: {
  defaultMode?: "sell" | "buy";
}) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"sell" | "buy">(defaultMode);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Array<{ id: string; name: string }>>([]);
  const [condition, setCondition] = useState<Condition>("good");
  const [asking, setAsking] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const { t } = useI18n();
  const condLabel: Record<Condition, CopyKey> = {
    like_new: "condLikeNew",
    good: "condGood",
    fair: "condFair",
    poor: "condPoor",
  };

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const handle = window.setTimeout(() => {
      void searchItems({ data: { q } }).then(setHits).catch(() => setHits([]));
    }, 180);
    return () => window.clearTimeout(handle);
  }, [query]);

  const askingCents = useMemo(() => {
    const n = Number(asking.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.round(n * 100);
  }, [asking]);

  async function runCatalog(catalogId: string) {
    setBusy(catalogId);
    try {
      const result = await createScan({
        data: {
          wallet: getWalletToken(),
          mode,
          kind: "catalog",
          catalogId,
          condition,
          askingCents,
        },
      });
      await navigate({ to: "/s/$token", params: { token: result.token } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("errPrice"));
    } finally {
      setBusy(null);
    }
  }

  async function runSearch() {
    if (!query.trim()) return;
    setBusy("search");
    try {
      const result = await createScan({
        data: {
          wallet: getWalletToken(),
          mode,
          kind: "search",
          query: query.trim(),
          condition,
          askingCents,
        },
      });
      await navigate({ to: "/s/$token", params: { token: result.token } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("errMiss"));
    } finally {
      setBusy(null);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy("photo");
    try {
      const imageBase64 = await compressImage(file);
      const result = await createScan({
        data: {
          wallet: getWalletToken(),
          mode,
          kind: "photo",
          imageBase64,
          askingCents,
        },
      });
      await navigate({ to: "/s/$token", params: { token: result.token } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("errPhoto"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4">
      <div className="flex rounded-xl bg-bg p-1">
        {(
          [
            ["sell", t("sellThis")],
            ["buy", t("checkAsk")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "h-10 flex-1 rounded-lg text-sm font-medium transition-colors duration-150",
              mode === id ? "bg-surface-2 text-fg" : "text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void runSearch();
            }}
            placeholder="iPhone 13, Sony XM5, PS5…"
            className="pl-9"
            aria-label={t("priceIt")}
          />
          {hits.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg bg-surface-2 shadow-[var(--shadow-border)]">
              {hits.map((hit) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    className="flex h-11 w-full items-center px-3 text-left text-sm hover:bg-surface"
                    onClick={() => void runCatalog(hit.id)}
                  >
                    {hit.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            type="button"
            onClick={() => void runSearch()}
            disabled={Boolean(busy) || query.trim().length < 2}
            className="min-h-11"
          >
            {busy === "search" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              t("priceIt")
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={Boolean(busy)}
            className="min-h-11"
          >
            {busy === "photo" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" />
            )}
            {t("photo")}
          </Button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(Object.keys(condLabel) as Condition[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCondition(c)}
            className={cn(
              "h-9 rounded-full px-3 text-xs font-medium",
              condition === c
                ? "bg-accent text-accent-fg"
                : "bg-surface-2 text-muted",
            )}
          >
            {t(condLabel[c])}
          </button>
        ))}
        {mode === "buy" && (
          <Input
            inputMode="decimal"
            value={asking}
            onChange={(e) => setAsking(e.target.value)}
            placeholder={t("askingPh")}
            className="h-9 w-28 text-xs"
            aria-label="Asking price"
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q.id}
            type="button"
            disabled={Boolean(busy)}
            onClick={() => void runCatalog(q.id)}
            className="h-9 rounded-full bg-bg px-3 text-xs text-muted shadow-[var(--shadow-border)] hover:text-fg"
          >
            {busy === q.id ? t("counting") : `${t("try")} ${q.label}`}
          </button>
        ))}
      </div>
    </section>
  );
}
