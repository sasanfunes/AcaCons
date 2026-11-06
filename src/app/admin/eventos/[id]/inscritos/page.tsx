import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { db } from "@/lib/db";
import { toggleAttendanceAction } from "@/server/actions/admin";
import { PROFESSIONS, REGISTRATION_STATUS_LABELS } from "@/lib/constants";
import { formatEventRange } from "@/lib/format";
import { CheckInForm } from "@/components/admin/event-forms";
import { Badge, Card, PageHeader } from "@/components/ui/misc";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Inscritos" };

const STATUSES = ["CONFIRMED", "WAITLISTED", "CANCELLED"] as const;
const tone = { CONFIRMED: "success", WAITLISTED: "warning", CANCELLED: "neutral" } as const;

export default async function Registrants({ params, searchParams }: PageProps<"/admin/eventos/[id]/inscritos">) {
  const { id } = await params;
  const { estado } = await searchParams;
  const status = STATUSES.find((s) => s === estado);
  const event = await db.event.findUnique({ where: { id } });
  if (!event) notFound();
  const [regs, counts] = await Promise.all([
    db.eventRegistration.findMany({
      where: { eventId: id, ...(status ? { status } : {}) },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      include: { user: { select: { name: true, email: true, phone: true, profession: true, company: true, city: true } } },
    }),
    db.eventRegistration.groupBy({ by: ["status"], where: { eventId: id }, _count: true }),
  ]);
  const count = Object.fromEntries(counts.map((c) => [c.status, c._count])) as Record<string, number>;
  const attended = await db.eventRegistration.count({ where: { eventId: id, checkedInAt: { not: null } } });

  return (
    <>
      <Link href={`/admin/eventos/${id}`} className="text-sm text-ink-600 hover:text-brand-700">
        ← Editar evento
      </Link>
      <PageHeader
        title={`Inscritos: ${event.title}`}
        description={formatEventRange(event.startsAt, event.endsAt, event.timezone)}
        actions={
          <a
            href={`/admin/eventos/${id}/inscritos.csv`}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-ink-300 bg-white px-4 text-sm font-medium hover:bg-ink-50"
          >
            <Download className="h-4 w-4" aria-hidden /> Exportar CSV
          </a>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <h2 className="mb-1 font-semibold">Registro de asistencia</h2>
          <p className="mb-3 text-sm text-ink-600">Escanee el QR o escriba el código de la entrada.</p>
          <CheckInForm eventId={id} />
        </Card>
        <Card className="grid grid-cols-2 gap-4 p-5 text-sm">
          <div>
            <p className="text-ink-500">Confirmados</p>
            <p className="text-2xl font-bold">
              {count.CONFIRMED ?? 0}
              <span className="text-base font-normal text-ink-500">/{event.capacity}</span>
            </p>
          </div>
          <div>
            <p className="text-ink-500">Lista de espera</p>
            <p className="text-2xl font-bold">{count.WAITLISTED ?? 0}</p>
          </div>
          <div>
            <p className="text-ink-500">Asistieron</p>
            <p className="text-2xl font-bold">{attended}</p>
          </div>
          <div>
            <p className="text-ink-500">Cancelaron</p>
            <p className="text-2xl font-bold">{count.CANCELLED ?? 0}</p>
          </div>
        </Card>
      </div>
      <div className="mb-3 flex flex-wrap gap-2 text-sm">
        {[undefined, ...STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `?estado=${s}` : "?"}
            className={cn("rounded-full border px-3 py-1", status === s ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-300 bg-white")}
          >
            {s ? REGISTRATION_STATUS_LABELS[s] : "Todos"}
          </Link>
        ))}
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-200 bg-ink-50 text-xs uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Profesión</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Entrada</th>
              <th className="px-4 py-3">Asistencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {regs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-500">
                  Sin inscripciones.
                </td>
              </tr>
            )}
            {regs.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium">
                  {r.user.name}
                  {r.user.company && <span className="block text-xs font-normal text-ink-500">{r.user.company}</span>}
                </td>
                <td className="px-4 py-3 text-xs">
                  {r.user.email}
                  {r.user.phone && <span className="block">{r.user.phone}</span>}
                </td>
                <td className="px-4 py-3 text-xs">{r.user.profession ? PROFESSIONS[r.user.profession] : "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={tone[r.status]}>{REGISTRATION_STATUS_LABELS[r.status]}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{r.ticketCode}</td>
                <td className="px-4 py-3">
                  {r.status === "CONFIRMED" && (
                    <form action={toggleAttendanceAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className={cn("rounded px-2 py-1 text-xs font-medium", r.checkedInAt ? "bg-green-100 text-green-800" : "bg-ink-100 text-ink-700 hover:bg-ink-200")}>
                        {r.checkedInAt ? "✔ Presente" : "Marcar presente"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
