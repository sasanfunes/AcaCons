import type { Metadata } from "next";
import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/guards";
import { setUserRoleAction } from "@/server/actions/admin";
import { COUNTRIES, PROFESSIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Badge, Card, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Usuarios" };
const PAGE = 50;

export default async function AdminUsers({ searchParams }: PageProps<"/admin/usuarios">) {
  const me = await requireAdmin();
  const { q, pagina } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const page = Math.max(1, Number(pagina) || 1);
  const where = query
    ? { OR: [{ name: { contains: query, mode: "insensitive" as const } }, { email: { contains: query, mode: "insensitive" as const } }, { company: { contains: query, mode: "insensitive" as const } }] }
    : {};
  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE,
      skip: (page - 1) * PAGE,
      include: { _count: { select: { enrollments: true, certificates: true, eventRegistrations: true } } },
    }),
    db.user.count({ where }),
  ]);
  const pages = Math.ceil(total / PAGE);
  return (
    <>
      <PageHeader title="Usuarios" description={`${total} usuarios${query ? ` que coinciden con “${query}”` : ""}`} />
      <form className="mb-4 flex max-w-md gap-2" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-500" aria-hidden />
          <Input name="q" defaultValue={query} placeholder="Nombre, correo o empresa" className="pl-9" aria-label="Buscar usuarios" />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-200 bg-ink-50 text-xs uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Profesión</th>
              <th className="px-4 py-3">Ubicación</th>
              <th className="px-4 py-3 text-right">Cursos</th>
              <th className="px-4 py-3 text-right">Certif.</th>
              <th className="px-4 py-3 text-right">Eventos</th>
              <th className="px-4 py-3">Alta</th>
              <th className="px-4 py-3">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <span className="font-medium">{u.name}</span>
                  <span className="block text-xs text-ink-500">
                    {u.email} {!u.emailVerified && <Badge tone="warning">sin verificar</Badge>}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{u.profession ? PROFESSIONS[u.profession] : "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {[u.city, u.department, COUNTRIES[u.country as keyof typeof COUNTRIES]].filter(Boolean).join(", ")}
                </td>
                <td className="px-4 py-3 text-right">{u._count.enrollments}</td>
                <td className="px-4 py-3 text-right">{u._count.certificates}</td>
                <td className="px-4 py-3 text-right">{u._count.eventRegistrations}</td>
                <td className="px-4 py-3 text-xs">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <form action={setUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <Badge tone={u.role === "ADMIN" ? "brand" : "neutral"}>{u.role === "ADMIN" ? "Admin" : "Usuario"}</Badge>
                    {u.id !== me.id && (
                      <button name="role" value={u.role === "ADMIN" ? "USER" : "ADMIN"} className="text-xs text-brand-700 hover:underline">
                        {u.role === "ADMIN" ? "Quitar admin" : "Hacer admin"}
                      </button>
                    )}
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {pages > 1 && (
        <nav className="mt-4 flex gap-2 text-sm" aria-label="Paginación">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?${new URLSearchParams({ ...(query ? { q: query } : {}), pagina: String(p) })}`}
              className={p === page ? "rounded bg-brand-600 px-3 py-1 text-white" : "rounded border border-ink-300 bg-white px-3 py-1"}
            >
              {p}
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
