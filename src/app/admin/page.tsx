import Link from "next/link";
import { redirect } from "next/navigation";
import { checkSession } from "@/lib/admin-session";
import { listQuoteRequests, listContactMessages } from "@/lib/data";
import { QUOTE_STATUS_LABELS } from "@/lib/types";

export default async function AdminOverviewPage() {
  const session = await checkSession();
  if (!session) redirect("/admin/login");

  const [quotes, messages] = await Promise.all([
    listQuoteRequests(),
    listContactMessages(),
  ]);
  const open = quotes.filter((q) => q.status === "nouveau" || q.status === "en_cours");
  const recent = quotes.slice(0, 8);

  const stats = [
    { label: "Nouvelles demandes", value: quotes.filter((q) => q.status === "nouveau").length },
    { label: "En cours", value: quotes.filter((q) => q.status === "en_cours").length },
    { label: "Total devis", value: quotes.length },
    { label: "Messages contact", value: messages.length },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow !text-steel-light">Vue d&apos;ensemble</p>
          <h1 className="display mt-2 text-3xl text-white">Bonjour, {session.email}</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/messages" className="btn btn-secondary !border-line-dark !bg-charcoal !text-white hover:!bg-white/10">
            Messages ({messages.length})
          </Link>
          <Link href="/admin/devis" className="btn btn-primary">
            Traiter les demandes
          </Link>
        </div>
      </header>

      <dl className="mt-10 grid gap-px border border-line-dark bg-line-dark sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-charcoal-soft/60 p-6">
            <dt className="tech-label !text-steel-light">{s.label}</dt>
            <dd className="display mt-2 text-4xl text-white">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-12" aria-labelledby="recent-title">
        <div className="flex items-center justify-between">
          <h2 id="recent-title" className="display text-xl text-white">
            Demandes récentes
          </h2>
          <Link
            href="/admin/devis"
            className="text-xs font-semibold text-steel-light hover:text-white"
          >
            Tout voir →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-6 border border-line-dark bg-charcoal-soft/40 p-8 text-center text-sm text-white/50">
            Aucune demande pour le moment. Les soumissions du formulaire de devis
            apparaîtront ici.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-line-dark border border-line-dark">
            {recent.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/admin/devis/${q.id}`}
                  className="flex flex-wrap items-center gap-3 bg-charcoal-soft/40 px-5 py-4 transition-colors hover:bg-white/5"
                >
                  <span className="font-mono text-sm text-steel-light">{q.reference}</span>
                  <span className="flex-1 truncate text-sm font-medium text-white">
                    {q.project_type} — {q.full_name}
                  </span>
                  <span className="tech-label !text-steel-light">
                    {new Date(q.created_at).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="border border-line-dark px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-white/70">
                    {QUOTE_STATUS_LABELS[q.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {open.length > 0 && (
          <p className="tech-label mt-4 !text-steel-light">
            {open.length} demande{open.length > 1 ? "s" : ""} à suivre.
          </p>
        )}
      </section>
    </div>
  );
}
