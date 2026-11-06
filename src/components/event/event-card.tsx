import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import type { EventCardData } from "@/server/queries/events";
import { COUNTRIES } from "@/lib/constants";
import { formatEventRange } from "@/lib/format";
import { seatsLeft } from "@/lib/domain/events";
import { Badge } from "@/components/ui/misc";

export function EventDateBadge({ date, timeZone }: { date: Date; timeZone: string }) {
  const day = new Intl.DateTimeFormat("es-HN", { day: "numeric", timeZone }).format(date);
  const month = new Intl.DateTimeFormat("es-HN", { month: "short", timeZone }).format(date).replace(".", "");
  return (
    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border-l-4 border-brand-500 bg-ink-900 text-white">
      <span className="text-2xl font-bold leading-none">{day}</span>
      <span className="text-xs uppercase">{month}</span>
    </div>
  );
}

export function EventCard({ event }: { event: EventCardData }) {
  const left = seatsLeft(event.capacity, event._count.registrations);
  const past = event.endsAt <= new Date();
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group flex gap-4 rounded-lg border border-ink-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <EventDateBadge date={event.startsAt} timeZone={event.timezone} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap gap-2">
          {event.category && <Badge tone="brand">{event.category.name}</Badge>}
          {past ? <Badge>Finalizado</Badge> : left === 0 ? <Badge tone="warning">Lista de espera</Badge> : left <= 5 ? <Badge tone="danger">Últimos {left} cupos</Badge> : null}
        </div>
        <h3 className="font-semibold text-ink-900 group-hover:text-brand-700">{event.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-600">{event.summary}</p>
        <ul className="mt-2 space-y-1 text-xs text-ink-600">
          <li className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> {formatEventRange(event.startsAt, event.endsAt, event.timezone)}
          </li>
          <li className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {event.venueName}, {event.city}, {COUNTRIES[event.country as keyof typeof COUNTRIES] ?? event.country}
          </li>
          {!past && (
            <li className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" aria-hidden /> {left > 0 ? `${left} cupos disponibles` : "Cupo completo"}
            </li>
          )}
        </ul>
      </div>
    </Link>
  );
}
