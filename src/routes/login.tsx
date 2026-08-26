import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GROK_PROVIDERS,
  authClient,
  authEnabled,
  signIn,
} from "@/lib/auth/client";
import { hasAcceptedConsent } from "@/lib/consent";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    next:
      typeof search.next === "string" && search.next.startsWith("/")
        ? search.next
        : "/",
  }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function requireConsent() {
    if (hasAcceptedConsent()) return true;
    setError("Godkänn cookies först (OK längst ner) så inloggning och betalning fungerar.");
    return false;
  }

  async function oauth(providerId: string) {
    if (!requireConsent()) return;
    setBusy(providerId);
    setError(null);
    try {
      await signIn(providerId, { callbackURL: next });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inloggning misslyckades.");
      setBusy(null);
    }
  }

  async function emailAuth(mode: "in" | "up") {
    if (!requireConsent()) return;
    setBusy(mode);
    setError(null);
    try {
      const fn =
        mode === "up"
          ? authClient.signUp.email({ email, password, name: email.split("@")[0] ?? "Konto" })
          : authClient.signIn.email({ email, password });
      const res = await fn;
      if (res.error) {
        setError(res.error.message ?? "Kunde inte logga in.");
        return;
      }
      await router.invalidate();
      await router.navigate({ to: next });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte logga in.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Shell>
      <div className="mx-auto w-full max-w-sm py-8">
        <p className="text-xs uppercase tracking-[0.18em] text-subtle">Konto</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Logga in</h1>
        <p className="mt-3 text-sm text-muted">
          Dina rapporter följer med kontot. Google, X eller e-post.
        </p>

        {authEnabled ? (
          <div className="mt-6 grid gap-2">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                disabled={Boolean(busy)}
                onClick={() => void oauth(p.providerId)}
              >
                Fortsätt med {p.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">Inloggning är avstängd.</p>
        )}

        <div className="mt-8 grid gap-2">
          <p className="text-xs uppercase tracking-[0.16em] text-subtle">E-post</p>
          <Input
            type="email"
            autoComplete="email"
            placeholder="du@mejl.se"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="E-post"
          />
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Lösenord"
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button
            type="button"
            disabled={Boolean(busy) || email.length < 3 || password.length < 8}
            onClick={() => void emailAuth("in")}
          >
            Logga in
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={Boolean(busy) || email.length < 3 || password.length < 8}
            onClick={() => void emailAuth("up")}
          >
            Skapa konto
          </Button>
        </div>
      </div>
    </Shell>
  );
}
