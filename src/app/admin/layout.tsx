import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { checkSession } from "@/lib/admin-session";
import AdminNav from "./AdminNav";
import LogoutButton from "./LogoutButton";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await checkSession();

  return (
    <div className="on-dark flex min-h-screen bg-charcoal text-white">
      {session && (
        <aside className="hidden w-64 shrink-0 flex-col border-r border-line-dark bg-charcoal-soft/60 lg:flex">
          <div className="border-b border-line-dark px-6 py-6">
            <Link href="/admin">
              <span className="display text-lg text-white">BHAR INOX</span>
              <span className="tech-label mt-1 block !text-steel-light">
                Administration
              </span>
            </Link>
          </div>
          <AdminNav />
          <div className="mt-auto border-t border-line-dark p-6">
            <p className="tech-label !text-steel-light truncate">
              {session.email}
            </p>
            <LogoutButton />
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {session && (
          <header className="flex items-center justify-between gap-4 border-b border-line-dark px-6 py-4 lg:hidden">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/brand/logo-2x.png"
                alt="BHAR INOX"
                width={45}
                height={18}
                className="h-8 w-auto"
              />
              <span className="tech-label !text-steel-light">Admin</span>
            </Link>
            <LogoutButton compact />
          </header>
        )}

        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
