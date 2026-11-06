import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOptionalUser } from "@/server/guards";
import { COUNTRIES, PROFESSIONS, REGISTRATION_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { slugify } from "@/lib/domain/slug";
import { toCsv } from "@/lib/csv";

export async function GET(_req: Request, ctx: RouteContext<"/admin/eventos/[id]/inscritos.csv">) {
  const user = await getOptionalUser();
  if (user?.role !== "ADMIN") return new NextResponse("No autorizado", { status: 403 });
  const { id } = await ctx.params;
  const event = await db.event.findUnique({ where: { id } });
  if (!event) return new NextResponse("No encontrado", { status: 404 });
  const regs = await db.eventRegistration.findMany({
    where: { eventId: id },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    include: { user: true },
  });
  const csv = toCsv([
    ["Nombre", "Correo", "Teléfono", "Profesión", "Empresa", "País", "Departamento", "Ciudad", "Estado", "Código de entrada", "Fecha de inscripción", "Asistencia"],
    ...regs.map((r) => [
      r.user.name,
      r.user.email,
      r.user.phone ?? "",
      r.user.profession ? PROFESSIONS[r.user.profession] : "",
      r.user.company ?? "",
      COUNTRIES[r.user.country as keyof typeof COUNTRIES] ?? r.user.country,
      r.user.department ?? "",
      r.user.city ?? "",
      REGISTRATION_STATUS_LABELS[r.status],
      r.ticketCode,
      formatDateTime(r.createdAt, event.timezone),
      r.checkedInAt ? "Sí" : "No",
    ]),
  ]);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscritos-${slugify(event.title)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
