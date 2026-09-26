import Link from "next/link";
import { redirect } from "next/navigation";
import { checkSession } from "@/lib/admin-session";
import { listContactMessages } from "@/lib/data";

export default async function AdminMessagesPage() {
  const session = await checkSession();
  if (!session) redirect("/admin/login");

  const messages = await listContactMessages();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow !text-steel-light">Messages reçus</p>
          <h1 className="display mt-2 text-3xl text-white">Formulaire de contact</h1>
        </div>
      </header>

      {messages.length === 0 ? (
        <p className="mt-10 border border-line-dark bg-charcoal-soft/40 p-10 text-center text-sm text-white/50">
          Aucun message reçu pour le moment.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className="border border-line-dark bg-charcoal-soft/40 p-6 transition-colors hover:border-line-dark/80"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-dark/60 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{m.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-steel-light">
                    <a
                      href={`mailto:${m.email}`}
                      className="text-royal hover:underline"
                      style={{ color: "#7f8cff" }}
                    >
                      {m.email}
                    </a>
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="hover:text-white">
                        📞 {m.phone}
                      </a>
                    )}
                  </div>
                </div>
                <time className="tech-label text-xs !text-steel-light">
                  {new Date(m.created_at).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </div>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                {m.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
