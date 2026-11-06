import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireUser } from "@/server/guards";
import { getMyRegistration, } from "@/server/queries/account";
import { cancelEventAction } from "@/server/actions/events";
import { COUNTRIES } from "@/lib/constants";
import { formatEventRange } from "@/lib/format";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert, Card } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Mi entrada" };

export default async function TicketPage({ params }: PageProps<"/mi-cuenta/eventos/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const reg = await getMyRegistration(user.id, id);
  if (!reg || reg.status === "CANCELLED") notFound();
  const { event } = reg;
  const qrSvg = await QRCode.toString(reg.ticketCode, { type: "svg", margin: 1, width: 220 });
  const canCancel = event.startsAt > new Date();

  return (
    <div className="mx-auto max-w-md">
      <Link href="/mi-cuenta/eventos" className="text-sm text-ink-600 hover:text-brand-700">
        ← Mis eventos
      </Link>
      <Card className="mt-4 overflow-hidden">
        <div className="bg-ink-900 p-5 text-white">
          <p className="text-xs uppercase tracking-wider text-brand-200">Entrada · evento presencial</p>
          <h2 className="mt-1 text-xl font-bold">{event.title}</h2>
        </div>
        <div className="space-y-4 p-5">
          {reg.status === "WAITLISTED" ? (
            <Alert>Está en lista de espera. La entrada se activará si se libera un cupo.</Alert>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-56" dangerouslySetInnerHTML={{ __html: qrSvg }} aria-label="Código QR de la entrada" role="img" />
              <p className="mt-2 font-mono text-lg font-bold tracking-wider">{reg.ticketCode}</p>
              <p className="text-xs text-ink-500">Presente este código en el ingreso.</p>
            </div>
          )}
          <dl className="space-y-2 border-t border-dashed border-ink-300 pt-4 text-sm">
            <div>
              <dt className="text-ink-500">Participante</dt>
              <dd className="font-medium">{reg.user.name}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Fecha y hora</dt>
              <dd className="font-medium first-letter:uppercase">{formatEventRange(event.startsAt, event.endsAt, event.timezone)}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Lugar</dt>
              <dd className="font-medium">
                {event.venueName}, {event.address}, {event.city}, {COUNTRIES[event.country as keyof typeof COUNTRIES] ?? event.country}
              </dd>
            </div>
            {reg.checkedInAt && (
              <div>
                <dt className="text-ink-500">Asistencia</dt>
                <dd className="font-medium text-green-700">Registrada</dd>
              </div>
            )}
          </dl>
          {canCancel && (
            <form action={cancelEventAction}>
              <input type="hidden" name="eventId" value={event.id} />
              <SubmitButton variant="ghost" className="w-full text-red-700" pendingText="Cancelando…">
                Cancelar mi inscripción
              </SubmitButton>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
