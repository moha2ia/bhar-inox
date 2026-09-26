import "server-only";

/* ============================================================
   Notifications email transactionnelles (Resend)
   - Sans RESEND_API_KEY : no-op silencieux (journal console).
   - Avec clé : envoi d'une confirmation client et d'une
     notification interne. Jamais bloquant pour l'utilisateur.
   ============================================================ */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

interface QuoteNotification {
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  projectType: string;
  location: string;
  filesCount: number;
}

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    `http://localhost:${process.env.PORT ?? 3000}`
  );
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[notify] RESEND_API_KEY absent — email non envoyé", {
      to,
      subject,
    });
    return;
  }
  const from = process.env.NOTIFY_FROM_EMAIL ?? "BHAR INOX <onboarding@resend.dev>";
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[notify] envoi impossible", {
        status: res.status,
        body: await res.text().catch(() => ""),
      });
    }
  } catch (err) {
    console.error("[notify] erreur réseau", {
      message: err instanceof Error ? err.message : "unknown",
    });
  }
}

/** Confirmation au client + notification interne. Ne lève jamais. */
export async function notifyQuoteReceived(q: QuoteNotification): Promise<void> {
  const internal = process.env.NOTIFY_EMAIL;
  const dashboardUrl = `${appUrl()}/admin/devis`;

  if (internal) {
    await send(
      internal,
      `Nouvelle demande de devis ${q.reference} — ${q.fullName}`,
      `<p>Nouvelle demande <strong>${q.reference}</strong>.</p>
       <ul>
         <li>Client : ${q.fullName} — ${q.email} — ${q.phone}</li>
         <li>Type de projet : ${q.projectType}</li>
         <li>Localisation : ${q.location}</li>
         <li>Pièces jointes : ${q.filesCount}</li>
       </ul>
       <p><a href="${dashboardUrl}">Ouvrir le tableau de bord</a></p>`,
    );
  }

  await send(
    q.email,
    `Votre demande de devis ${q.reference} — BHAR INOX`,
    `<p>Bonjour ${q.fullName},</p>
     <p>Nous avons bien reçu votre demande de devis concernant : <strong>${q.projectType}</strong> (référence <strong>${q.reference}</strong>).</p>
     <p>Notre équipe revient vers vous avec une proposition dans les meilleurs délais.</p>
     <p style="color:#5C6C6A">BHAR INOX — La menuiserie<br/>Im. 2, Mag. 1, Lot Arryan Bab Bettioui, Meknès</p>`,
  );
}
