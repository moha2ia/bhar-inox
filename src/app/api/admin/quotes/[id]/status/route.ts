import { NextResponse } from "next/server";
import { checkSession } from "@/lib/admin-session";
import { updateQuoteStatus } from "@/lib/data";
import { QUOTE_STATUS_ORDER, type QuoteStatus } from "@/lib/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await checkSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const status = body.status as QuoteStatus;
  if (!QUOTE_STATUS_ORDER.includes(status)) {
    return NextResponse.json({ error: "Statut inconnu." }, { status: 422 });
  }

  try {
    await updateQuoteStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "La mise à jour a échoué.",
      },
      { status: 500 },
    );
  }
}
