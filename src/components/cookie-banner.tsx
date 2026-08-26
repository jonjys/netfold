import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { readConsent, writeConsent } from "@/lib/consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface p-4 shadow-[0_-8px_30px_rgba(28,27,24,0.08)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Vi använder cookies för att betalning och inloggning ska fungera.{" "}
          <Link to="/privacy" className="underline underline-offset-2 hover:text-fg">
            Läs mer
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              writeConsent("declined");
              setVisible(false);
            }}
          >
            Avböj
          </Button>
          <Button
            size="sm"
            onClick={() => {
              writeConsent("accepted");
              setVisible(false);
            }}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
