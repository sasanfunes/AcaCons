import Link from "next/link";
import { adminDashboard } from "@/server/queries/admin";
import { formatDate, formatEventRange } from "@/lib/format";
import { PROFESSIONS } from "@/lib/constants";
import { Card, PageHeader } from "@/components/ui/misc";

export default async function AdminHome() {
  const { users, newUsers, enrollments, completions, certificates, events, byProfession, recentUsers } = await adminDashboard();
  const stats = [
    { label: "Usuarios registrados", value: users, hint: `+${newUsers} en 30 días` },
    { label: "Inscripciones a cursos", value: enrollments },
    { label: "Cursos completados", value: completions, hint: enrollments ? `${Math.round((completions / enrollments) * 100)}% de finalización` : undefined },
    { label: "Certificados emitidos", value: certificates },
  ];
  return (
    <>
      <PageHeader title="Resumen" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-ink-600">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
            {s.hint && <p className="mt-1 text-xs text-ink-500">{s.hint}</p>}
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h2 className="mb-3 font-semibold">Próximos eventos</h2>
          {events.length === 0 ? (
            <p className="text-sm text-ink-600">No hay eventos publicados próximos.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                  <div>
                    <Link href={`/admin/eventos/${e.id}/inscritos`} className="font-medium hover:text-brand-700">
                      {e.title}
                    </Link>
                    <p className="text-xs text-ink-500">{formatEventRange(e.startsAt, e.endsAt, e.timezone)}</p>
                  </div>
                  <span className="whitespace-nowrap text-ink-700">
                    {e._count.registrations}/{e.capacity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Usuarios por profesión</h2>
          <ul className="space-y-2 text-sm">
            {byProfession.map((p) => (
              <li key={p.profession ?? "none"} className="flex justify-between">
                <span>{p.profession ? PROFESSIONS[p.profession] : "Sin especificar"}</span>
                <span className="font-medium">{p._count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 xl:col-span-3">
          <h2 className="mb-3 font-semibold">Últimos registros</h2>
          <ul className="divide-y divide-ink-100 text-sm">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex justify-between gap-4 py-2">
                <span>
                  <span className="font-medium">{u.name}</span> <span className="text-ink-500">{u.email}</span>
                </span>
                <span className="text-ink-500">
                  {u.city ? `${u.city} · ` : ""}
                  {formatDate(u.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
