import { Link, useRouter } from "@tanstack/react-router";
import { Check, Copy, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { hasAcceptedConsent } from "@/lib/consent";
import { formatEuro, formatEuroRange } from "@/lib/money";
import { applyCredit } from "@/lib/server/scan";
import { startCheckout as startPay } from "@/lib/server/stripe";
import { SKUS } from "@/lib/skus";
import type { ScanFull, ScanTeaser } from "@/lib/types";
import { getWalletToken } from "@/lib/wallet-client";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { CopyKey } from "@/lib/copy";
import { channelCopyKey } from "@/lib/channels";

function isFull(view: ScanTeaser | ScanFull): view is ScanFull {
  return "items" in view && Array.isArray((view as ScanFull).items);
}

export function ScanView({ view }: { view: ScanTeaser | ScanFull }) {
  const unlocked = view.unlocked && isFull(view);
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useI18n();
  const skuName = { report: t("skuReport"), extract: t("skuExtract"), pack: t("skuPack") };
  const bestChannel = t(channelCopyKey(view.bestChannelId, view.bestChannelShort));

  async function pay(sku: "report" | "extract" | "pack") {
    if (!hasAcceptedConsent()) {
      toast.error(t("cookieFirst"));
      return;
    }
    setBusy(sku);
    try {
      const credit = await applyCredit({
        data: { wallet: getWalletToken(), token: view.token, kit: sku !== "report" },
      });
      if (credit.ok) {
        toast.success(t("unlockedCredit"));
        await router.invalidate();
        return;
      }
      const session = await startPay({
        data: { sku, wallet: getWalletToken(), scanToken: view.token },
      });
      window.location.href = session.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "Cookies required") {
        toast.error(t("cookieNeed"));
        return;
      }
      toast.error(msg || t("checkoutFail"));
    } finally {
      setBusy(null);
    }
  }

  const headline = unlocked
    ? formatEuro(view.bestTakeHomeCents)
    : formatEuroRange(view.rangeLowCents, view.rangeHighCents);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-subtle">
          {view.mode === "buy" ? t("modeBuy") : t("modeSell")}
        </p>
        <h1 className="mt-2 font-display text-5xl leading-none tracking-tight sm:text-6xl">
          {headline}
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted">
          {view.itemCount === 1 ? view.names[0] : `${view.itemCount} ${t("items")}`} · {t("bestNet")}{" "}
          {bestChannel}
          {view.trappedVsInstantCents > 800
            ? ` · ${t("instantLeaves")} ${unlocked ? formatEuro(view.trappedVsInstantCents) : t("aLot")} ${t("onTable")}`
            : null}
        </p>

        {unlocked ? (
          <ItemStack full={view} />
        ) : (
          <ul className="mt-8 divide-y divide-border rounded-2xl bg-surface px-4 shadow-[var(--shadow-border)]">
            {view.names.map((name) => (
              <li key={name} className="flex h-14 items-center justify-between text-sm">
                <span>{name}</span>
                <Lock className="size-3.5 text-subtle" />
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        {unlocked ? (
          <UnlockedPanel full={view} />
        ) : (
          <>
            <p className="font-display text-2xl tracking-tight">{t("unlockNet")}</p>
            <p className="mt-2 text-sm text-muted">{t("unlockLead")}</p>
            <div className="mt-5 grid gap-2">
              <Button
                size="lg"
                disabled={Boolean(busy)}
                onClick={() => void pay("report")}
              >
                {skuName.report} · {formatEuro(SKUS.report.amountCents, true)}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                disabled={Boolean(busy)}
                onClick={() => void pay("extract")}
              >
                {skuName.extract} · {formatEuro(SKUS.extract.amountCents, true)}
              </Button>
              <Button
                variant="ghost"
                disabled={Boolean(busy)}
                onClick={() => void pay("pack")}
              >
                {skuName.pack} · {formatEuro(SKUS.pack.amountCents, true)}
              </Button>
            </div>
            <p className="mt-4 text-xs text-subtle">{t("payFineprint")}</p>
          </>
        )}
      </aside>
    </div>
  );
}

function ItemStack({ full }: { full: ScanFull }) {
  const { t } = useI18n();
  const cond: Record<string, CopyKey> = {
    like_new: "condLikeNew",
    good: "condGood",
    fair: "condFair",
    poor: "condPoor",
  };
  return (
    <div className="mt-8 grid gap-3">
      {full.items.map((item) => (
        <article
          key={item.slug + item.condition}
          className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl tracking-tight">{item.name}</h2>
              <p className="mt-1 text-xs text-subtle">
                {t(cond[item.condition] ?? "condGood")} · {item.category}
              </p>
            </div>
            <p className="font-mono text-lg tabular-nums">
              {formatEuro(item.bestTakeHomeCents)}
            </p>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <Stat label={t("ask")} value={formatEuro(item.askCents)} />
            <Stat label={t("accept")} value={formatEuro(item.acceptCents)} />
            <Stat label={t("walk")} value={formatEuro(item.walkCents)} />
          </dl>
          <ol className="mt-4 grid gap-1.5">
            {item.quotes.map((q) => (
              <li
                key={q.channelId}
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-2 text-sm",
                  q.rank === 1 ? "bg-bg" : "",
                )}
              >
                <span className="text-muted">
                  {q.rank}. {t(channelCopyKey(q.channelId, q.short))}
                  <span className="ml-2 text-xs text-subtle">{q.daysToSold}d</span>
                </span>
                <span className="font-mono tabular-nums">
                  {formatEuro(q.takeHomeCents)}
                </span>
              </li>
            ))}
          </ol>
        </article>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-bg px-2 py-2">
      <p className="text-subtle">{label}</p>
      <p className="mt-1 font-mono tabular-nums text-fg">{value}</p>
    </div>
  );
}

function UnlockedPanel({ full }: { full: ScanFull }) {
  const [copied, setCopied] = useState<string | null>(null);
  const { t } = useI18n();
  const shareUrl =
    typeof window === "undefined"
      ? `/s/${full.token}`
      : `${window.location.origin}/s/${full.token}`;
  const shareText = `${t("shareLine")} ${formatEuro(full.bestTakeHomeCents)} ${t("for")} ${full.names.join(", ")} ${t("via")}`;

  async function copy(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(t("copied"));
  }

  return (
    <div>
      <p className="font-display text-2xl tracking-tight">{t("extractTitle")}</p>
      <p className="mt-2 text-sm text-muted">{t("extractLead")}</p>
      <div className="mt-4 grid gap-2">
        <Button
          variant="secondary"
          onClick={() => void copy("link", `${shareText} ${shareUrl}`)}
        >
          {copied === "link" ? <Check className="size-4" /> : <Copy className="size-4" />}
          {t("shareFigure")}
        </Button>
        {full.items[0] && (
          <Link
            to="/i/$slug"
            params={{ slug: full.items[0].slug }}
            className="inline-flex h-11 items-center justify-center rounded-md text-sm text-muted hover:text-fg"
          >
            {t("openIndex")}
          </Link>
        )}
      </div>
      {full.hasKit && full.kits ? (
        <div className="mt-6 grid gap-4">
          {full.kits.map((kit) => (
            <div key={kit.itemName} className="rounded-xl bg-bg p-3">
              <p className="text-sm font-medium">{kit.itemName}</p>
              <p className="mt-2 text-xs text-subtle">{kit.acceptLine}</p>
              <div className="mt-3 grid gap-2">
                {kit.listings.slice(0, 2).map((listing) => (
                  <button
                    key={listing.channelId}
                    type="button"
                    className="rounded-md bg-surface-2 px-3 py-2 text-left text-xs text-muted hover:text-fg"
                    onClick={() =>
                      void copy(listing.channelId, `${listing.title}\n\n${listing.body}`)
                    }
                  >
                    {t("copyListing")} {listing.channelId}
                  </button>
                ))}
                <button
                  type="button"
                  className="rounded-md bg-surface-2 px-3 py-2 text-left text-xs text-muted hover:text-fg"
                  onClick={() => void copy("lowball", kit.lowballReply)}
                >
                  {t("copyLowball")}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-xs text-subtle">{t("reportUnlocked")}</p>
      )}
    </div>
  );
}
