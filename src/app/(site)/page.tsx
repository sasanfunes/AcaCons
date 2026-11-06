import Link from "next/link";
import { Award, CalendarDays, FileText, PlayCircle } from "lucide-react";
import { featuredCourses, listCategoriesWithCourses } from "@/server/queries/courses";
import { upcomingEvents } from "@/server/queries/events";
import { listBrands } from "@/server/queries/brands";
import { homeStats } from "@/server/queries/home";
import { getOptionalUser } from "@/server/guards";
import { CourseCard } from "@/components/course/course-card";
import { EventCard } from "@/components/event/event-card";
import { Logo } from "@/components/ui/cover";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/misc";

export default async function Home() {
  const [courses, events, brands, categories, stats, user] = await Promise.all([
    featuredCourses(3),
    upcomingEvents({ take: 3 }),
    listBrands(),
    listCategoriesWithCourses(),
    homeStats(),
    getOptionalUser(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #fff 1px, transparent 1px), linear-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "80px 40px",
          }}
        />
        <Container className="relative grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 inline-block rounded-full bg-brand-600/20 px-3 py-1 text-sm font-medium text-brand-200">
              Formación gratuita para Honduras y Centroamérica
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Aprenda a construir mejor con los <span className="text-brand-500">materiales correctos</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink-300">
              Cursos en video, evaluaciones y certificados sobre concreto, mampostería, impermeabilización, techos y más.
              Además, talleres presenciales con los fabricantes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/cursos" size="lg">
                Ver cursos
              </ButtonLink>
              {user ? (
                <ButtonLink href="/mi-cuenta" size="lg" variant="outline">
                  Continuar aprendiendo
                </ButtonLink>
              ) : (
                <ButtonLink href="/registro" size="lg" variant="outline">
                  Crear cuenta gratis
                </ButtonLink>
              )}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {[
              { label: "Cursos disponibles", value: stats.courses },
              { label: "Próximos eventos", value: stats.events },
              { label: "Marcas aliadas", value: stats.brands },
              { label: "Certificados emitidos", value: stats.certificates },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <dt className="text-sm text-ink-300">{s.label}</dt>
                <dd className="mt-1 text-3xl font-bold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Container className="py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: PlayCircle, title: "Videos prácticos", text: "Lecciones cortas, a su ritmo, desde el celular o la computadora." },
            { icon: Award, title: "Certificados verificables", text: "Al aprobar la evaluación final, descargue su certificado con código QR." },
            { icon: CalendarDays, title: "Eventos presenciales", text: "Talleres y demostraciones en obra con cupos limitados." },
            { icon: FileText, title: "Fichas técnicas", text: "Descargue la información técnica de los productos de cada marca." },
          ].map((f) => (
            <div key={f.title}>
              <f.icon className="h-8 w-8 text-brand-600" aria-hidden />
              <h2 className="mt-3 font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-ink-600">{f.text}</p>
            </div>
          ))}
        </div>
      </Container>

      {courses.length > 0 && (
        <section className="bg-ink-50 py-14">
          <Container>
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-2xl font-bold">Cursos destacados</h2>
              <Link href="/cursos" className="text-sm font-medium text-brand-700 hover:underline">
                Ver todos →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
            {categories.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cursos?categoria=${c.slug}`}
                    className="rounded-full border border-ink-300 bg-white px-3 py-1 text-sm hover:border-brand-600 hover:text-brand-700"
                  >
                    {c.name} ({c._count.courses})
                  </Link>
                ))}
              </div>
            )}
          </Container>
        </section>
      )}

      {events.length > 0 && (
        <Container className="py-14">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Próximos eventos presenciales</h2>
            <Link href="/eventos" className="text-sm font-medium text-brand-700 hover:underline">
              Ver agenda →
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </Container>
      )}

      {brands.length > 0 && (
        <section className="border-t border-ink-200 py-12">
          <Container>
            <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-ink-500">Con el apoyo de</h2>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {brands.map((b) => (
                <Link key={b.id} href={`/marcas/${b.slug}`} className="flex items-center gap-2 opacity-80 hover:opacity-100">
                  <Logo fileKey={b.logoKey} alt="" className="h-10 w-10" />
                  <span className="font-semibold text-ink-700">{b.name}</span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
