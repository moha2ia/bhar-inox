import Link from "next/link";
import { redirect } from "next/navigation";
import { checkSession } from "@/lib/admin-session";
import { listQuoteRequests } from "@/lib/data";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_ORDER, type QuoteStatus } from "@/lib/types";

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; q?: string; tri?: string }>;
}) {
  const session = await checkSession();
  if (!session) redirect("/admin/login");

  const { statut, q, tri } = await searchParams;
  const status = QUOTE_STATUS_ORDER.includes(statut as QuoteStatus)
    ? (statut as QuoteStatus)
    : undefined;

  let quotes = await listQuoteRequests({ status, search: q });
  if (tri === "ancien") {
    quotes = [...quotes].sort(
      (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow !text-steel-light">Gestion des devis</p>
          <h1 className="display mt-2 text-3xl text-white">Demandes reçues</h1>
        </div>
        <form className="flex flex-wrap gap-2" action="/admin/devis" method="get">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Référence, nom, email…"
            aria-label="Rechercher une demande"
            className="field !w-64 !border-line-dark !bg-charcoal !text-white"
          />
          <button type="submit" className="btn btn-primary !px-5 !py-2.5 text-sm">
            Rechercher
          </button>
        </form>
      </header>

      <nav aria-label="Filtrer par statut" className="mt-8 flex flex-wrap gap-2">
        <FilterLink href="/admin/devis" active={!statut}>Tous</FilterLink>
        {QUOTE_STATUS_ORDER.map((s) => (
          <FilterLink
            key={s}
            href={`/admin/devis?statut=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            active={statut === s}
          >
            {QUOTE_STATUS_LABELS[s]}
          </FilterLink>
        ))}
      </nav>

      {quotes.length === 0 ? (
        <p className="mt-10 border border-line-dark bg-charcoal-soft/40 p-10 text-center text-sm text-white/50">
          Aucune demande ne correspond à ces critères.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-line-dark">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Demandes de devis</caption>
            <thead>
              <tr className="border-b border-line-dark bg-charcoal-soft/70 text-steel-light">
                <th scope="col" className="px-5 py-3 font-semibold">Référence</th>
                <th scope="col" className="px-5 py-3 font-semibold">Demandeur</th>
                <th scope="col" className="px-5 py-3 font-semibold">Type</th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  <Link
                    href={`/admin/devis?tri=${tri === "ancien" ? "recent" : "ancien"}`}
                    className="hover:text-white"
                  >
                    Date {tri === "ancien" ? "↑" : tri === "recent" ? "↓" : ""}
                  </Link>
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">Statut</th>
                <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-dark">
              {quotes.map((quote) => (
                <tr key={quote.id} className="bg-charcoal-soft/30 hover:bg-white/5">
                  <td className="px-5 py-4 font-mono text-xs text-steel-light">
                    {quote.reference}
                  </td>
                  <td className="px-5 py-4 font-medium text-white">
                    {quote.full_name}
                    <span className="block text-xs font-normal text-white/50">
                      {quote.email}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/80">{quote.project_type}</td>
                  <td className="px-5 py-4 text-steel-light">
                    {new Date(quote.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-4">
                    <span className="border border-line-dark px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-white/70">
                      {QUOTE_STATUS_LABELS[quote.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/devis/${quote.id}`}
                      className="text-xs font-semibold text-royal hover:underline"
                      style={{ color: "#7f8cff" }}
                    >
                      Détail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`border px-4 py-2 text-xs font-semibold transition-colors ${
        active
          ? "border-white bg-white text-charcoal"
          : "border-line-dark text-white/70 hover:border-white/40 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
