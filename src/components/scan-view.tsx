import { Link, useRouter } from "@tanstack/react-router";
import { Check, Copy, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { hasAcceptedConsent } from "@/lib/consent";
import { formatMoney, formatMoneyRange } from "@/lib/money";
import { applyCredit } from "@/lib/server/scan";
import { startCheckout as startPay } from "@/lib/server/stripe";
import { formatSkuPrice } from "@/lib/skus";
import type { ScanFull, ScanTeaser } from "@/lib/types";
import { getWalletToken } from "@/lib/wallet-client";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { CopyKey, Lang } from "@/lib/copy";
import { channelCopyKey } from "@/lib/channels";
import { buildAllKits, lockedAdPreview } from "@/lib/listings";
import { VsCard } from "@/components/vs-card";

function isFull(view: ScanTeaser | ScanFull): view is ScanFull {
  return "items" in view && Array.isArray((view as ScanFull).items);
}

export function ScanView({ view }: { view: ScanTeaser | ScanFull }) {
  const unlocked = view.unlocked && isFull(view);
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();
  const { t, lang } = useI18n();
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
        data: { sku, wallet: getWalletToken(), scanToken: view.token, lang },
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
    ? formatMoney(view.bestTakeHomeCents, lang)
    : view.trappedVsInstantCents > 800
      ? `${formatMoney(view.trappedVsInstantCents, lang)} ${t("vsHeadline")}`
      : formatMoneyRange(view.rangeLowCents, view.rangeHighCents, lang);
  const swappieCents = Math.max(0, view.bestTakeHomeCents - view.trappedVsInstantCents);

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
        </p>
        <VsCard blocketCents={view.bestTakeHomeCents} swappieCents={swappieCents} />

        {unlocked ? (
          <>
            <ListingHero full={view} lang={lang} />
            <ItemStack full={view} />
          </>
        ) : (
          <>
            <LockedAd names={view.names} lang={lang} />
            <ul className="mt-6 divide-y divide-border rounded-2xl bg-surface px-4 shadow-[var(--shadow-border)]">
              {view.names.map((name) => (
                <li key={name} className="flex h-14 items-center justify-between text-sm">
                  <span>{name}</span>
                  <Lock className="size-3.5 text-subtle" />
                </li>
              ))}
            </ul>
          </>
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
                {skuName.report} · {formatSkuPrice("report", lang)}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                disabled={Boolean(busy)}
                onClick={() => void pay("extract")}
              >
                {skuName.extract} · {formatSkuPrice("extract", lang)}
              </Button>
              <Button
                variant="ghost"
                disabled={Boolean(busy)}
                onClick={() => void pay("pack")}
              >
                {skuName.pack} · {formatSkuPrice("pack", lang)}
              </Button>
            </div>
            <p className="mt-4 text-xs text-subtle">{t("payFineprint")}</p>
          </>
        )}
      </aside>
    </div>
  );
}

function LockedAd({ names, lang }: { names: string[]; lang: Lang }) {
  const { t } = useI18n();
  const preview = lockedAdPreview(names[0] ?? "Item", lang);
  return (
    <article className="relative mt-8 overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs uppercase tracking-[0.18em] text-subtle">{t("adKicker")}</p>
      <h2 className="mt-2 font-display text-xl tracking-tight">{preview.title}</h2>
      <p className="mt-3 select-none text-sm leading-relaxed text-muted blur-[3.5px]">
        {preview.body}
      </p>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent" />
      <p className="relative mt-4 flex items-center gap-2 text-xs text-subtle">
        <Lock className="size-3" />
        {t("adLockedLead")}
      </p>
    </article>
  );
}

function ListingHero({ full, lang }: { full: ScanFull; lang: Lang }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const kit = useMemo(
    () => (full.items?.length ? buildAllKits(full.items, lang)[0] : full.kits?.[0]),
    [full, lang],
  );
  const listing = kit?.listings[0];
  if (!listing) return null;
  const ad = listing;

  async function copy() {
    await navigator.clipboard.writeText(`${ad.title}\n\n${ad.body}`);
    setCopied(true);
    toast.success(t("copied"));
  }

  return (
    <article className="mt-8 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-subtle">{t("adKicker")}</p>
      <h2 className="mt-2 font-display text-2xl tracking-tight">{listing.title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">{listing.body}</p>
      <Button className="mt-4" onClick={() => void copy()}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {t("copyListing")}
      </Button>
    </article>
  );
}

function ItemStack({ full }: { full: ScanFull }) {
  const { t, lang } = useI18n();
  const cond: Record<string, CopyKey> = {
    like_new: "condLikeNew",
    good: "condGood",
    fair: "condFair",
    poor: "condPoor",
  };
  return (
    <div className="mt-8 grid gap-3">
      <p className="text-xs uppercase tracking-[0.18em] text-subtle">{t("netsTitle")}</p>
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
              {formatMoney(item.bestTakeHomeCents, lang)}
            </p>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <Stat label={t("ask")} value={formatMoney(item.askCents, lang)} />
            <Stat label={t("accept")} value={formatMoney(item.acceptCents, lang)} />
            <Stat label={t("walk")} value={formatMoney(item.walkCents, lang)} />
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
                  {formatMoney(q.takeHomeCents, lang)}
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
  const { t, lang } = useI18n();
  const kits = full.items?.length ? buildAllKits(full.items, lang) : (full.kits ?? []);
  const shareUrl =
    typeof window === "undefined"
      ? `/s/${full.token}`
      : `${window.location.origin}/s/${full.token}`;
  const shareText = `${t("shareLine")} ${formatMoney(full.bestTakeHomeCents, lang)} ${t("for")} ${full.names.join(", ")} ${t("via")}`;

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
      {kits.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {kits.map((kit) => (
            <div key={kit.itemName} className="rounded-xl bg-bg p-3">
              <p className="text-sm font-medium">{kit.itemName}</p>
              <p className="mt-2 text-xs text-subtle">{kit.acceptLine}</p>
              <div className="mt-3 grid gap-2">
                {kit.listings.map((listing) => (
                  <button
                    key={listing.channelId}
                    type="button"
                    className="rounded-md bg-surface-2 px-3 py-2 text-left text-xs text-muted hover:text-fg"
                    onClick={() =>
                      void copy(listing.channelId, `${listing.title}\n\n${listing.body}`)
                    }
                  >
                    {t("copyListing")} {t(channelCopyKey(listing.channelId))}
                  </button>
                ))}
                <button
                  type="button"
                  className="rounded-md bg-surface-2 px-3 py-2 text-left text-xs text-muted hover:text-fg"
                  onClick={() => void copy("lowball", kit.lowballReply)}
                >
                  {t("copyLowball")}
                </button>
                <button
                  type="button"
                  className="rounded-md bg-surface-2 px-3 py-2 text-left text-xs text-muted hover:text-fg"
                  onClick={() => void copy("first", kit.firstMessage)}
                >
                  {t("copyFirst")}
                </button>
                <button
                  type="button"
                  className="rounded-md bg-surface-2 px-3 py-2 text-left text-xs text-muted hover:text-fg"
                  onClick={() => void copy("hold", kit.holdMessage)}
                >
                  {t("copyHold")}
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
