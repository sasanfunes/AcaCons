import type { Metadata } from "next";
import Link from "next/link";
import { pastEvents, upcomingEvents } from "@/server/queries/events";
import { COUNTRIES } from "@/lib/constants";
import { EventCard } from "@/components/event/event-card";
import { Container, EmptyState, PageHeader } from "@/components/ui/misc";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Eventos presenciales",
  description: "Talleres, jornadas técnicas y demostraciones de materiales de construcción en Honduras y Centroamérica.",
};

export default async function EventosPage({ searchParams }: PageProps<"/eventos">) {
  const { pais } = await searchParams;
  const country = typeof pais === "string" && pais in COUNTRIES ? pais : undefined;
  const [upcoming, past] = await Promise.all([upcomingEvents({ country }), pastEvents(4)]);

  return (
    <Container className="py-10">
      <PageHeader
        title="Eventos presenciales"
        description="Talleres prácticos, jornadas técnicas y demostraciones con fabricantes. Inscripción gratuita con cupos limitados."
      />
      <div className="mb-6 flex flex-wrap gap-2" role="navigation" aria-label="Filtrar por país">
        {[["", "Todos"], ...Object.entries(COUNTRIES)].map(([code, name]) => (
          <Link
            key={code}
            href={code ? `/eventos?pais=${code}` : "/eventos"}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              (country ?? "") === code ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-300 hover:border-brand-600",
            )}
          >
            {name}
          </Link>
        ))}
      </div>
      {upcoming.length === 0 ? (
        <EmptyState title="No hay eventos próximos">Vuelva pronto: publicamos nuevas fechas cada mes.</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-ink-700">Eventos anteriores</h2>
          <div className="grid gap-4 opacity-80 lg:grid-cols-2">
            {past.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
