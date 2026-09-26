"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className={`mt-4 border border-line-dark px-4 py-2 text-xs font-semibold text-white/70 transition-colors hover:border-white/40 hover:text-white ${
        compact ? "mt-0" : ""
      }`}
    >
      {busy ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
