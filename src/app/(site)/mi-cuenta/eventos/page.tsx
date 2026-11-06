import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/server/guards";
import { getMyRegistrations } from "@/server/queries/account";
import { REGISTRATION_STATUS_LABELS } from "@/lib/constants";
import { formatEventRange } from "@/lib/format";
import { EventDateBadge } from "@/components/event/event-card";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card, EmptyState } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Mis eventos" };

export default async function MyEventsPage() {
  const user = await requireUser();
  const regs = await getMyRegistrations(user.id);
  const now = new Date();
  const upcoming = regs.filter((r) => r.event.endsAt > now);
  const past = regs.filter((r) => r.event.endsAt <= now);

  if (regs.length === 0) {
    return (
      <EmptyState title="No está inscrito en ningún evento" action={<ButtonLink href="/eventos">Ver agenda de eventos</ButtonLink>}>
        Participe en talleres y demostraciones presenciales con los fabricantes.
      </EmptyState>
    );
  }
  return (
    <div className="space-y-8">
      {[
        ["Próximos", upcoming],
        ["Anteriores", past],
      ].map(([title, list]) =>
        (list as typeof regs).length ? (
          <section key={title as string}>
            <h2 className="mb-3 text-lg font-bold">{title as string}</h2>
            <ul className="space-y-3">
              {(list as typeof regs).map((r) => (
                <li key={r.id}>
                  <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <EventDateBadge date={r.event.startsAt} timeZone={r.event.timezone} />
                    <div className="min-w-0 flex-1">
                      <Link href={`/eventos/${r.event.slug}`} className="font-semibold hover:text-brand-700">
                        {r.event.title}
                      </Link>
                      <p className="text-sm text-ink-600">{formatEventRange(r.event.startsAt, r.event.endsAt, r.event.timezone)}</p>
                      <p className="text-sm text-ink-600">
                        {r.event.venueName}, {r.event.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={r.status === "CONFIRMED" ? "success" : "warning"}>
                        {r.checkedInAt ? "Asistió" : REGISTRATION_STATUS_LABELS[r.status]}
                      </Badge>
                      {r.status === "CONFIRMED" && (
                        <ButtonLink href={`/mi-cuenta/eventos/${r.eventId}`} size="sm" variant="outline">
                          Ver entrada
                        </ButtonLink>
                      )}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}
