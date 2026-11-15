import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { checkSession } from "@/lib/admin-session";
import { listQuoteRequests, listQuoteFiles, updateQuoteStatus } from "@/lib/data";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_ORDER, type QuoteStatus } from "@/lib/types";
import StatusChanger from "./StatusChanger";

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await checkSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const quotes = await listQuoteRequests();
  const quote = quotes.find((q) => q.id === id);
  if (!quote) notFound();

  const files = await listQuoteFiles(quote.reference);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/devis" className="tech-label !text-steel-light hover:!text-white">
        ← Toutes les demandes
      </Link>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="font-mono text-sm text-steel-light">{quote.reference}</p>
          <h1 className="display mt-2 text-3xl text-white">
            {quote.project_type}
          </h1>
          <p className="tech-label mt-2 !text-steel-light">
            Reçue le{" "}
            {new Date(quote.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <StatusChanger
          quoteId={quote.id}
          current={quote.status}
          statuses={QUOTE_STATUS_ORDER}
          labels={QUOTE_STATUS_LABELS}
        />
      </header>

      <div className="mt-10 grid gap-px border border-line-dark bg-line-dark lg:grid-cols-[1.4fr_1fr]">
        <section className="bg-charcoal-soft/40 p-8" aria-labelledby="q-desc-title">
          <h2 id="q-desc-title" className="eyebrow !text-steel-light">
            Description du besoin
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/85">
            {quote.description}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
            <Detail label="Lieu" value={quote.location} />
            <Detail label="Dimensions" value={quote.dimensions} />
            <Detail label="Quantité" value={quote.quantity ? String(quote.quantity) : null} />
            <Detail label="Finition" value={quote.finish} />
            <Detail label="Budget" value={quote.budget} />
            <Detail label="Délai souhaité" value={quote.deadline} />
          </dl>
        </section>

        <aside className="bg-charcoal-soft/40 p-8">
          <h2 className="eyebrow !text-steel-light">Demandeur</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <Detail label="Nom" value={quote.full_name} />
            {quote.company && <Detail label="Entreprise" value={quote.company} />}
            <div>
              <dt className="tech-label !text-steel-light">Téléphone</dt>
              <dd className="mt-1">
                <a href={`tel:${quote.phone.replace(/\s/g, "")}`} className="text-white hover:underline" style={{ color: "#9aa8ff" }}>
                  {quote.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="tech-label !text-steel-light">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${quote.email}`} className="hover:underline" style={{ color: "#9aa8ff" }}>
                  {quote.email}
                </a>
              </dd>
            </div>
          </dl>

          <hr className="hairline-dark my-7" />

          <h2 className="eyebrow !text-steel-light">Pièces jointes</h2>
          {files.length === 0 ? (
            <p className="mt-3 text-sm text-white/40">Aucun document joint.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {files.map((f) => (
                <li key={f.file_name} className="border border-line-dark p-3 text-sm">
                  <p className="truncate font-medium text-white/85">{f.file_name}</p>
                  <p className="tech-label mt-1 !text-steel-light">
                    {(f.file_size / 1024).toFixed(0)} Ko · {f.file_type}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="tech-label !text-steel-light">{label}</dt>
      <dd className="mt-1 text-white/85">{value ?? <span className="text-white/30">—</span>}</dd>
    </div>
  );
}
