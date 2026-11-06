import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/server/guards";
import { signOutAction } from "@/server/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { countUnansweredQuestions } from "@/server/services/qa";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = { title: { default: "Administración", template: "%s · Admin · La Academia del Constructor" }, robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  const pendingQuestions = await countUnansweredQuestions();
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-l-8 border-brand-500 bg-ink-900 p-4 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
        <div className="mb-4 flex items-center justify-between lg:block">
          <Logo dark />
          <p className="hidden text-xs text-ink-500 lg:mt-1 lg:block">Panel de administración</p>
        </div>
        <AdminNav pendingQuestions={pendingQuestions} />
        <div className="mt-6 hidden border-t border-white/10 pt-4 text-sm text-ink-300 lg:block">
          <p className="truncate">{user.name}</p>
          <Link href="/" className="mt-2 block hover:text-white">
            ← Ver sitio
          </Link>
          <form action={signOutAction}>
            <button className="mt-1 hover:text-white">Cerrar sesión</button>
          </form>
        </div>
      </aside>
      <main id="contenido" className="min-w-0 flex-1 bg-marfil p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
