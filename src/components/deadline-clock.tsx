import { useEffect, useState } from "react";
import { formatRemaining, isPast, remainingParts, remainingRatio } from "@/lib/listings";
import { useI18n } from "@/lib/i18n";

export function DeadlineClock({
  at,
  size = "inline",
}: {
  at: Date;
  size?: "inline" | "hero" | "bar";
}) {
  const { t, lang } = useI18n();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const current = new Date(now);

  if (isPast(at, current)) {
    return <span className="text-sm text-warn">{t("clockGone")}</span>;
  }

  if (size === "bar") {
    const pct = Math.round(remainingRatio(at, current) * 100);
    return (
      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-ok transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p
          suppressHydrationWarning
          className="mt-2 font-mono text-sm tabular-nums text-ok"
        >
          {formatRemaining(at, lang, current)} {t("clockLeft")} · {t("sampleThen")}
        </p>
      </div>
    );
  }

  if (size === "hero") {
    const { h, m, s } = remainingParts(at, current);
    const cells = [
      { n: String(h).padStart(2, "0"), u: t("clockUnitH") },
      { n: String(m).padStart(2, "0"), u: t("clockUnitM") },
      { n: String(s).padStart(2, "0"), u: t("clockUnitS") },
    ];
    return (
      <div className="grid grid-cols-3 gap-2" aria-label={t("adKicker")} suppressHydrationWarning>
        {cells.map((c) => (
          <div
            key={c.u}
            className="rounded-xl bg-surface px-2 py-3 text-center shadow-[var(--shadow-border)]"
          >
            <p
              suppressHydrationWarning
              className="font-mono text-4xl tabular-nums leading-none tracking-tight text-ok sm:text-5xl"
            >
              {c.n}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-subtle">{c.u}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span suppressHydrationWarning className="font-mono tabular-nums text-ok">
      {formatRemaining(at, lang, current)} {t("clockLeft")}
    </span>
  );
}
