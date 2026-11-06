import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import { getEventBySlug, getUserRegistration, waitlistPosition } from "@/server/queries/events";
import { getOptionalUser } from "@/server/guards";
import { cancelEventAction } from "@/server/actions/events";
import { canRegister, seatsLeft } from "@/lib/domain/events";
import { COUNTRIES, TIMEZONES } from "@/lib/constants";
import { formatDateTime, formatEventRange } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { RegisterEventButton } from "@/components/event/register-button";
import { Cover, Logo } from "@/components/ui/cover";
import { ButtonLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert, Badge, Card, Container } from "@/components/ui/misc";

export async function generateMetadata({ params }: PageProps<"/eventos/[slug]">): Promise<Metadata> {
  const e = await getEventBySlug((await params).slug);
  return e ? { title: e.title, description: e.summary } : {};
}

export default async function EventPage({ params }: PageProps<"/eventos/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const user = await getOptionalUser();
  const reg = await getUserRegistration(user?.id, event.id);
  const active = reg && reg.status !== "CANCELLED" ? reg : null;
  const left = seatsLeft(event.capacity, event._count.registrations);
  const check = canRegister(event);
  const position = active?.status === "WAITLISTED" ? await waitlistPosition(event.id, active.createdAt) : null;
  const country = COUNTRIES[event.country as keyof typeof COUNTRIES] ?? event.country;

  return (
    <Container className="grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0">
        <nav aria-label="Ruta" className="mb-3 text-sm text-ink-600">
          <Link href="/eventos" className="hover:text-brand-700">
            ← Eventos
          </Link>
        </nav>
        <Cover fileKey={event.coverKey} alt="" className="rounded-lg" />
        <div className="mt-6 flex flex-wrap gap-2">
          {event.category && <Badge tone="brand">{event.category.name}</Badge>}
          <Badge>Presencial</Badge>
        </div>
        <h1 className="mt-2 text-3xl font-bold">{event.title}</h1>
        <p className="mt-2 text-lg text-ink-600">{event.summary}</p>
        <div className="prose-acacons mt-6 text-ink-700" dangerouslySetInnerHTML={{ __html: renderMarkdown(event.description) }} />
        {event.sponsors.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-500">Organiza</h2>
            <div className="flex flex-wrap gap-4">
              {event.sponsors.map((s) => (
                <Link key={s.id} href={`/marcas/${s.slug}`} className="flex items-center gap-2 rounded-lg border border-ink-200 p-2 pr-4 hover:shadow">
                  <Logo fileKey={s.logoKey} alt="" className="h-10 w-10" />
                  <span className="font-medium">{s.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card className="space-y-4 p-5">
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <CalendarDays className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <span>
                <span className="font-medium first-letter:uppercase">{formatEventRange(event.startsAt, event.endsAt, event.timezone)}</span>
                <span className="block text-xs text-ink-500">
                  Hora de {TIMEZONES[event.timezone as keyof typeof TIMEZONES] ?? event.timezone}
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <span>
                <span className="font-medium">{event.venueName}</span>
                <span className="block text-ink-600">
                  {event.address}, {event.city}
                  {event.department ? `, ${event.department}` : ""}, {country}
                </span>
                {event.mapUrl && (
                  <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-700 underline">
                    Ver en el mapa
                  </a>
                )}
              </span>
            </li>
            <li className="flex gap-3">
              <Users className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <span>{left > 0 ? `${left} de ${event.capacity} cupos disponibles` : `Cupo completo (${event.capacity} personas)`}</span>
            </li>
          </ul>
          {event.registrationClosesAt && (
            <p className="text-xs text-ink-500">Inscripciones hasta el {formatDateTime(event.registrationClosesAt, event.timezone)}.</p>
          )}

          {active ? (
            <div className="space-y-3">
              {active.status === "CONFIRMED" ? (
                <Alert tone="success">
                  Su inscripción está <strong>confirmada</strong>.
                </Alert>
              ) : (
                <Alert>
                  Está en la <strong>lista de espera</strong> (posición {position}). Le avisaremos por correo si se libera un cupo.
                </Alert>
              )}
              {active.status === "CONFIRMED" && (
                <ButtonLink href={`/mi-cuenta/eventos/${event.id}`} className="w-full">
                  <Ticket className="h-4 w-4" aria-hidden /> Ver mi entrada
                </ButtonLink>
              )}
              {check.ok && (
                <form action={cancelEventAction}>
                  <input type="hidden" name="eventId" value={event.id} />
                  <input type="hidden" name="back" value={`/eventos/${event.slug}`} />
                  <SubmitButton variant="ghost" className="w-full text-red-700" pendingText="Cancelando…">
                    Cancelar inscripción
                  </SubmitButton>
                </form>
              )}
            </div>
          ) : !check.ok ? (
            <Alert>{check.reason}</Alert>
          ) : user ? (
            <RegisterEventButton eventId={event.id} full={left === 0} />
          ) : (
            <ButtonLink href={`/ingresar?volver=${encodeURIComponent(`/eventos/${event.slug}`)}`} className="w-full" size="lg">
              Ingresar para inscribirme
            </ButtonLink>
          )}
        </Card>
      </aside>
    </Container>
  );
}
