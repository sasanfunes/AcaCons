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
import { Container, SectionTitle } from "@/components/ui/misc";

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
      <section className="bg-ink-900 text-white">
        <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="border-l-8 border-brand-500 pl-6 sm:pl-8">
            <p className="kicker text-brand-500">Del aula a la obra</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Formación técnica que se aplica en la obra al día siguiente.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-200">
              Cursos por sistema constructivo, con evaluación y certificado, para arquitectos, ingenieros y constructores de
              Honduras y Centroamérica. Preparación, instalación y mantenimiento: sistemas completos, no productos sueltos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/cursos" size="lg" variant="accent">
                Ver el programa de cursos
              </ButtonLink>
              {user ? (
                <ButtonLink href="/mi-cuenta" size="lg" variant="outline">
                  Continuar mis cursos
                </ButtonLink>
              ) : (
                <ButtonLink href="/registro" size="lg" variant="outline">
                  Crear cuenta
                </ButtonLink>
              )}
            </div>
            <p className="kicker mt-8 text-ink-300">Un programa de Construnova</p>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-white/10">
            {[
              { label: "Cursos disponibles", value: stats.courses },
              { label: "Sesiones presenciales", value: stats.events },
              { label: "Fabricantes", value: stats.brands },
              { label: "Certificados emitidos", value: stats.certificates },
            ].map((s) => (
              <div key={s.label} className="bg-ink-900 p-5">
                <dd className="text-4xl font-bold text-brand-500">{s.value}</dd>
                <dt className="mt-1 text-sm text-ink-200">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Container className="py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: PlayCircle, title: "Módulos por sistema", text: "Lecciones en video con normas, especificaciones y procedimientos de instalación." },
            { icon: Award, title: "Evaluación y certificado", text: "Al aprobar la evaluación final obtiene un certificado verificable con código QR." },
            { icon: CalendarDays, title: "Sesiones presenciales", text: "Demostraciones en aula y en obra con instructores de experiencia de campo." },
            { icon: FileText, title: "Fichas técnicas", text: "Información técnica de cada sistema para especificar e instalar correctamente." },
          ].map((f) => (
            <div key={f.title} className="border-t-2 border-ink-900 pt-4">
              <f.icon className="h-8 w-8 text-brand-500" aria-hidden />
              <h2 className="mt-3 font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-ink-600">{f.text}</p>
            </div>
          ))}
        </div>
      </Container>

      {courses.length > 0 && (
        <section className="border-y border-ink-200 bg-white py-14">
          <Container>
            <SectionTitle
              kicker="Programa"
              title="Cursos destacados"
              action={
                <Link href="/cursos" className="text-sm font-medium text-brand-700 hover:underline">
                  Ver todos →
                </Link>
              }
            />
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
                    className="rounded-sm border border-ink-300 bg-marfil px-3 py-1 text-sm hover:border-ink-900"
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
          <SectionTitle
            kicker="Sesiones técnicas"
            title="Próximos eventos presenciales"
            action={
              <Link href="/eventos" className="text-sm font-medium text-brand-700 hover:underline">
                Ver agenda →
              </Link>
            }
          />
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
