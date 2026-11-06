import Link from "next/link";
import {
  Award,
  BrickWall,
  CalendarDays,
  Droplets,
  FileText,
  Hammer,
  Home as HomeIcon,
  Layers,
  PaintRoller,
  PlayCircle,
  ShowerHead,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import { coursesByCategory, featuredCourses, recentCourses } from "@/server/queries/courses";
import { upcomingEvents } from "@/server/queries/events";
import { listBrands } from "@/server/queries/brands";
import { homeStats } from "@/server/queries/home";
import { getMyCourses } from "@/server/queries/account";
import { getOptionalUser } from "@/server/guards";
import { CourseCard } from "@/components/course/course-card";
import { CategoryTabs } from "@/components/course/category-tabs";
import { EventCard } from "@/components/event/event-card";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Logo } from "@/components/ui/cover";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionTitle } from "@/components/ui/misc";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "concreto-y-cemento": Layers,
  "mamposteria-y-bloques": BrickWall,
  impermeabilizacion: Droplets,
  aislamiento: Thermometer,
  "construccion-en-seco": Hammer,
  "techos-y-cubiertas": HomeIcon,
  "pinturas-y-recubrimientos": PaintRoller,
  "instalaciones-hidrosanitarias": ShowerHead,
};

export default async function Home() {
  const user = await getOptionalUser();
  const [featured, recent, tabs, events, brands, stats, mine] = await Promise.all([
    featuredCourses(10),
    recentCourses(10),
    coursesByCategory(10),
    upcomingEvents({ take: 3 }),
    listBrands(),
    homeStats(),
    user ? getMyCourses(user.id) : Promise.resolve([]),
  ]);
  const inProgress = mine.filter((e) => !e.completedAt);

  return (
    <>
      {/* Banner principal */}
      <section className="bg-marfil pt-6 sm:pt-8">
        <Container>
          <div className="overflow-hidden rounded-md border-l-8 border-brand-500 bg-ink-900 text-white">
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
              <div>
                <p className="kicker text-brand-500">{user ? `Bienvenido de nuevo, ${user.name.split(" ")[0]}` : "Del aula a la obra"}</p>
                <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">
                  Formación técnica que se aplica en la obra al día siguiente.
                </h1>
                <p className="mt-4 max-w-xl text-ink-200 sm:text-lg">
                  Cursos por sistema constructivo, con evaluación y certificado, para arquitectos, ingenieros y constructores de
                  Honduras y Centroamérica.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {user && inProgress[0] ? (
                    <ButtonLink href={inProgress[0].nextHref} size="lg" variant="accent">
                      Continuar: {inProgress[0].course.title.split(":")[0]}
                    </ButtonLink>
                  ) : (
                    <ButtonLink href="/cursos" size="lg" variant="accent">
                      Ver el programa de cursos
                    </ButtonLink>
                  )}
                  {!user && (
                    <ButtonLink href="/registro" size="lg" variant="outline">
                      Crear cuenta
                    </ButtonLink>
                  )}
                </div>
                <p className="kicker mt-6 text-ink-300">Un programa de Construnova</p>
              </div>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-white/10">
                {[
                  { label: "Cursos disponibles", value: stats.courses },
                  { label: "Sesiones presenciales", value: stats.events },
                  { label: "Fabricantes", value: stats.brands },
                  { label: "Certificados emitidos", value: stats.certificates },
                ].map((s) => (
                  <div key={s.label} className="bg-ink-900 p-5">
                    <dd className="text-3xl font-bold text-brand-500 sm:text-4xl">{s.value}</dd>
                    <dt className="mt-1 text-sm text-ink-200">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      {/* Continúe aprendiendo */}
      {inProgress.length > 0 && (
        <Container className="pt-12">
          <SectionTitle
            kicker="Mi aprendizaje"
            title="Continúe aprendiendo"
            action={
              <Link href="/mi-cuenta" className="text-sm font-medium text-brand-700 hover:underline">
                Ir a Mi aprendizaje →
              </Link>
            }
          />
          <Carousel label="Cursos en progreso">
            {inProgress.map((e) => (
              <CarouselItem key={e.id}>
                <CourseCard course={e.course} progress={e.progress} href={e.nextHref} />
              </CarouselItem>
            ))}
          </Carousel>
        </Container>
      )}

      {/* Selección por categoría */}
      {tabs.length > 0 && (
        <Container className="pt-12">
          <div className="mb-5">
            <p className="kicker mb-1 text-brand-700">Programa de formación</p>
            <h2 className="text-2xl font-bold sm:text-3xl">Una amplia selección de cursos técnicos</h2>
            <p className="mt-1 text-ink-600">Sistemas completos, no productos sueltos: preparación, instalación y mantenimiento.</p>
          </div>
          <CategoryTabs tabs={tabs} />
        </Container>
      )}

      {featured.length > 0 && (
        <Container className="pt-12">
          <SectionTitle kicker="Recomendados" title="Cursos destacados" action={<Link href="/cursos" className="text-sm font-medium text-brand-700 hover:underline">Ver todos →</Link>} />
          <Carousel label="Cursos destacados">
            {featured.map((c) => (
              <CarouselItem key={c.id}>
                <CourseCard course={c} />
              </CarouselItem>
            ))}
          </Carousel>
        </Container>
      )}

      {recent.length > 0 && (
        <Container className="pt-12">
          <SectionTitle kicker="Novedades" title="Agregados recientemente" action={<Link href="/cursos?orden=recientes" className="text-sm font-medium text-brand-700 hover:underline">Ver todos →</Link>} />
          <Carousel label="Cursos agregados recientemente">
            {recent.map((c) => (
              <CarouselItem key={c.id}>
                <CourseCard course={c} />
              </CarouselItem>
            ))}
          </Carousel>
        </Container>
      )}

      {/* Categorías principales */}
      {tabs.length > 0 && (
        <Container className="pt-12">
          <SectionTitle kicker="Explorar" title="Categorías principales" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {tabs.map((c) => {
              const Icon = CATEGORY_ICONS[c.slug] ?? Layers;
              return (
                <Link
                  key={c.id}
                  href={`/cursos?categoria=${c.slug}`}
                  className="group flex items-center gap-3 rounded-md border border-ink-200 bg-white p-4 hover:border-ink-900"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50">
                    <Icon className="h-5 w-5 text-brand-700" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold leading-tight text-ink-900">{c.name}</span>
                    <span className="text-xs text-ink-500">
                      {c._count.courses} {c._count.courses === 1 ? "curso" : "cursos"}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      )}

      {/* Cómo funciona */}
      <section className="mt-14 border-y border-ink-200 bg-white py-12">
        <Container>
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
      </section>

      {events.length > 0 && (
        <Container className="pt-12">
          <SectionTitle
            kicker="Sesiones técnicas"
            title="Próximos eventos presenciales"
            action={<Link href="/eventos" className="text-sm font-medium text-brand-700 hover:underline">Ver agenda →</Link>}
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </Container>
      )}

      {brands.length > 0 && (
        <section className="pt-14">
          <Container>
            <h2 className="kicker mb-6 text-center text-ink-500">Con el apoyo de</h2>
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
