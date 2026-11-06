import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { STATUS_LABELS } from "@/lib/constants";
import { formatEventRange } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Eventos" };
const tone = { DRAFT: "warning", PUBLISHED: "success", ARCHIVED: "neutral" } as const;

export default async function AdminEvents() {
  const events = await db.event.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });
  const waitlists = await db.eventRegistration.groupBy({ by: ["eventId"], where: { status: "WAITLISTED" }, _count: true });
  const wl = new Map(waitlists.map((w) => [w.eventId, w._count]));
  const now = new Date();
  return (
    <>
      <PageHeader title="Eventos" actions={<ButtonLink href="/admin/eventos/nuevo">Nuevo evento</ButtonLink>} />
      {events.length === 0 ? (
        <EmptyState title="Todavía no hay eventos" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-200 bg-ink-50 text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">Evento</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Confirmados</th>
                <th className="px-4 py-3 text-right">En espera</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {events.map((e) => (
                <tr key={e.id} className={e.endsAt < now ? "text-ink-500" : ""}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/eventos/${e.id}`} className="font-medium hover:text-brand-700">
                      {e.title}
                    </Link>
                    <p className="text-xs text-ink-500">{e.city}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{formatEventRange(e.startsAt, e.endsAt, e.timezone)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={tone[e.status]}>{STATUS_LABELS[e.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e._count.registrations}/{e.capacity}
                  </td>
                  <td className="px-4 py-3 text-right">{wl.get(e.id) ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/eventos/${e.id}/inscritos`} className="text-brand-700 hover:underline">
                      Inscritos
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
