import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { DeadlineClock } from "@/components/deadline-clock";
import { getProof } from "@/lib/server/scan";
import { formatMoney } from "@/lib/money";
import { useI18n } from "@/lib/i18n";
import { DEMO_PROOF_TOKEN } from "@/lib/listings";

export const Route = createFileRoute("/b/$token")({
  loader: async ({ params }) => getProof({ data: { token: params.token } }),
  head: ({ params }) => {
    const index = params.token === DEMO_PROOF_TOKEN;
    return {
      meta: [
        { title: index ? "Köparbevis — iPhone 14 Pro Max | Netfold" : "Köparbevis | Netfold" },
        {
          name: "description",
          content: "Fast Blocket-pris, räknat mot sålda. Inte påhittat. Hämtas den här veckan.",
        },
        { name: "robots", content: index ? "index,follow" : "noindex" },
      ],
    };
  },
  component: ProofPage,
});

function ProofPage() {
  const data = Route.useLoaderData();
  const { t, lang } = useI18n();

  if (!data.ok) {
    return (
      <Shell>
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">{t("proofKicker")}</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight">{t("proofUnpublished")}</h1>
        <p className="mt-3 max-w-md text-sm text-muted">{t("proofFoot")}</p>
        <Link to="/" className="mt-6 inline-block text-sm text-muted hover:text-fg">
          Netfold
        </Link>
      </Shell>
    );
  }

  const { proof } = data;
  const deadline = new Date(proof.deadlineISO);
  const condKey =
    proof.condition === "like_new"
      ? "condLikeNew"
      : proof.condition === "fair"
        ? "condFair"
        : proof.condition === "poor"
          ? "condPoor"
          : "condGood";

  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">{t("proofKicker")}</p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl tracking-tight sm:text-5xl">
        {t("proofTitle")}
      </h1>
      <p className="mt-4 max-w-lg text-base text-muted">{t("proofLead")}</p>

      <article className="mt-8 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-subtle">{t("adKicker")}</p>
        <h2 className="mt-2 font-display text-2xl tracking-tight">{proof.name}</h2>
        <p className="mt-1 text-sm text-muted">{t(condKey)}</p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-bg px-4 py-3">
            <dt className="text-xs text-subtle">{t("proofFirm")}</dt>
            <dd className="mt-1 font-mono text-2xl tabular-nums">{formatMoney(proof.firmCents, lang)}</dd>
          </div>
          <div className="rounded-xl bg-bg px-4 py-3">
            <dt className="text-xs text-subtle">{t("deadlineKicker")}</dt>
            <dd className="mt-1">
              <DeadlineClock at={deadline} />
            </dd>
            <p className="mt-1 text-xs text-subtle">{t("proofUntil")}</p>
          </div>
        </dl>

        <p className="mt-5 text-sm text-muted">
          {t("proofThen")} {t("vsSwappie")} {formatMoney(proof.swappieCents, lang)} {t("vsSwappieWhen")}.
        </p>
      </article>

      <p className="mt-6 text-xs text-subtle">{t("proofFoot")}</p>
    </Shell>
  );
}
