import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Trash2, Users } from "lucide-react";
import { db } from "@/lib/db";
import { utcToZonedLocal } from "@/lib/format";
import { deleteEventAction } from "@/server/actions/admin";
import { EventForm } from "@/components/admin/event-forms";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ButtonLink } from "@/components/ui/button";
import { Alert, Card, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Editar evento" };

export default async function EditEvent({ params, searchParams }: PageProps<"/admin/eventos/[id]">) {
  const { id } = await params;
  const { creado } = await searchParams;
  const [event, categories, brands] = await Promise.all([
    db.event.findUnique({ where: { id }, include: { sponsors: { select: { id: true } }, _count: { select: { registrations: true } } } }),
    db.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } }),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!event) notFound();
  const tz = event.timezone;
  return (
    <>
      <PageHeader
        title={event.title}
        actions={
          <>
            <ButtonLink href={`/admin/eventos/${event.id}/inscritos`}>
              <Users className="h-4 w-4" aria-hidden /> Inscritos
            </ButtonLink>
            <ButtonLink href={`/eventos/${event.slug}`} variant="outline" target="_blank">
              <ExternalLink className="h-4 w-4" aria-hidden /> Ver
            </ButtonLink>
            <form action={deleteEventAction}>
              <input type="hidden" name="id" value={event.id} />
              <ConfirmButton
                message={event._count.registrations ? "El evento tiene inscritos: se archivará. ¿Continuar?" : "¿Eliminar el evento?"}
                className="text-red-700"
              >
                <Trash2 className="h-4 w-4" aria-hidden /> {event._count.registrations ? "Archivar" : "Eliminar"}
              </ConfirmButton>
            </form>
          </>
        }
      />
      {creado && <Alert tone="success" className="mb-4">Evento creado. Recuerde cambiar el estado a “Publicado” para abrir las inscripciones.</Alert>}
      <Card className="p-6">
        <EventForm
          categories={categories}
          brands={brands}
          event={{
            ...event,
            startsAt: utcToZonedLocal(event.startsAt, tz),
            endsAt: utcToZonedLocal(event.endsAt, tz),
            registrationClosesAt: event.registrationClosesAt ? utcToZonedLocal(event.registrationClosesAt, tz) : "",
            sponsorIds: event.sponsors.map((s) => s.id),
          }}
        />
      </Card>
    </>
  );
}
