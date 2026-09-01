import { useEffect, useState } from "react";
import { formatDeadline, formatRemaining, isPast } from "@/lib/listings";
import { useI18n } from "@/lib/i18n";

export function DeadlineClock({ at }: { at: Date }) {
  const { t, lang } = useI18n();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now === null) {
    return <span className="font-mono tabular-nums text-ok">{formatDeadline(at, lang)}</span>;
  }

  if (isPast(at, new Date(now))) {
    return <span className="text-sm text-warn">{t("clockGone")}</span>;
  }

  return (
    <span className="font-mono tabular-nums text-ok">
      {formatRemaining(at, lang, new Date(now))} {t("clockLeft")}
    </span>
  );
}
