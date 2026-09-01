import { formatMoney } from "@/lib/money";
import { useI18n } from "@/lib/i18n";
import { formatSkuPrice } from "@/lib/skus";

export function VsCard({
  blocketCents,
  swappieCents,
}: {
  blocketCents: number;
  swappieCents: number;
}) {
  const { t, lang } = useI18n();
  const delta = Math.max(0, blocketCents - swappieCents);
  return (
    <section className="mt-6 overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]">
      <div className="grid grid-cols-3 divide-x divide-border">
        <div className="px-3 py-4 sm:px-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">{t("vsSwappie")}</p>
          <p className="mt-1 font-mono text-base tabular-nums sm:text-lg">
            {formatMoney(swappieCents, lang)}
          </p>
          <p className="mt-1 text-[11px] text-subtle">{t("vsSwappieWhen")}</p>
        </div>
        <div className="px-3 py-4 sm:px-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">{t("vsBlocket")}</p>
          <p className="mt-1 font-mono text-base tabular-nums sm:text-lg">
            {formatMoney(blocketCents, lang)}
          </p>
          <p className="mt-1 text-[11px] text-subtle">{t("vsBlocketWhen")}</p>
        </div>
        <div className="bg-bg px-3 py-4 sm:px-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">{t("vsDelta")}</p>
          <p className="mt-1 font-mono text-base tabular-nums text-ok sm:text-lg">
            {formatMoney(delta, lang)}
          </p>
          <p className="mt-1 text-[11px] text-subtle">{t("vsWhy")}</p>
        </div>
      </div>
      <p className="border-t border-border px-4 py-3 text-xs text-muted">
        {t("vsPay")} · {formatSkuPrice("report", lang)}
      </p>
    </section>
  );
}
