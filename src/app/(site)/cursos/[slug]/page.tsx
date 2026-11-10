import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  Check,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  Globe,
  MonitorSmartphone,
  PlayCircle,
  Users,
  Video,
} from "lucide-react";
import {
  coursesInCategory,
  getCourseBySlug,
  getUserCourseState,
  lessonOrder,
} from "@/server/queries/courses";
import { getOptionalUser } from "@/server/guards";
import { enrollAction } from "@/server/actions/learning";
import { courseProgress, nextPendingLesson } from "@/lib/domain/progress";
import { LEVELS } from "@/lib/constants";
import { formatBytes, formatDuration } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { fileUrl } from "@/lib/storage/url";
import { Curriculum } from "@/components/course/curriculum";
import { Expandable } from "@/components/course/expandable";
import { CourseCard } from "@/components/course/course-card";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Cover, Logo } from "@/components/ui/cover";
import { ButtonLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert, Badge, Container, ProgressBar } from "@/components/ui/misc";

export async function generateMetadata({ params }: PageProps<"/cursos/[slug]">): Promise<Metadata> {
  const course = await getCourseBySlug((await params).slug);
  return course ? { title: course.title, description: course.summary } : {};
}

const monthYear = (d: Date) =>
  new Intl.DateTimeFormat("es-HN", {
    month: "long",
    year: "numeric",
    timeZone: "America/Tegucigalpa",
  }).format(d);

export default async function CoursePage({ params, searchParams }: PageProps<"/cursos/[slug]">) {
  const { slug } = await params;
  const { completado } = await searchParams;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  const user = await getOptionalUser();
  const [state, related] = await Promise.all([
    getUserCourseState(user?.id, course.id),
    coursesInCategory(course.categoryId, course.id, 10),
  ]);
  const lessons = lessonOrder(course);
  const lessonIds = lessons.map((l) => l.id);
  const progress = state ? courseProgress(lessonIds, state.completedIds) : 0;
  const nextLesson = state ? nextPendingLesson(lessonIds, state.completedIds) : null;
  const allLessonsDone = state ? lessonIds.every((id) => state.completedIds.has(id)) : false;
  const pendingFinal = course.quizzes.find((q) => q.required && !state?.bestByQuiz.get(q.id)?.passed);
  const firstPreview = lessons.find((l) => l.isPreview);
  const videoMinutes = lessons.reduce((n, l) => n + l.durationMinutes, 0);
  const quizCount = course.quizzes.length + course.modules.reduce((n, m) => n + m.quizzes.length, 0);

  const cta = state ? (
    state.certificate ? (
      <ButtonLink href={`/certificados/${state.certificate.code}`} className="w-full" size="lg">
        <Award className="h-4 w-4" aria-hidden /> Ver mi certificado
      </ButtonLink>
    ) : allLessonsDone && pendingFinal ? (
      <ButtonLink
        href={`/cursos/${course.slug}/evaluacion/${pendingFinal.id}`}
        className="w-full"
        size="lg"
        variant="accent"
      >
        Rendir evaluación final
      </ButtonLink>
    ) : nextLesson ? (
      <ButtonLink
        href={`/cursos/${course.slug}/leccion/${nextLesson}`}
        className="w-full"
        size="lg"
        variant="accent"
      >
        {progress === 0 ? "Comenzar curso" : "Continuar curso"}
      </ButtonLink>
    ) : null
  ) : user ? (
    <form action={enrollAction}>
      <input type="hidden" name="courseId" value={course.id} />
      <SubmitButton className="w-full" size="lg" variant="accent" pendingText="Inscribiendo…">
        Inscribirme gratis
      </SubmitButton>
    </form>
  ) : (
    <ButtonLink
      href={`/registro?volver=${encodeURIComponent(`/cursos/${course.slug}`)}`}
      className="w-full"
      size="lg"
      variant="accent"
    >
      Inscribirme gratis
    </ButtonLink>
  );

  const includes = [
    { icon: Video, text: `${formatDuration(videoMinutes || course.estimatedMinutes)} de video bajo demanda` },
    { icon: PlayCircle, text: `${lessons.length} lecciones` },
    ...(quizCount
      ? [{ icon: ClipboardCheck, text: `${quizCount} ${quizCount === 1 ? "evaluación" : "evaluaciones"}` }]
      : []),
    ...(course.technicalSheets.length
      ? [{ icon: Download, text: `${course.technicalSheets.length} fichas técnicas descargables` }]
      : []),
    { icon: MonitorSmartphone, text: "Acceso desde el celular y la computadora" },
    { icon: Award, text: "Certificado al aprobar" },
  ];

  const sideCard = (
    <div className="overflow-hidden rounded-md border border-ink-200 bg-white shadow-xl">
      <Link
        href={firstPreview ? `/cursos/${course.slug}/leccion/${firstPreview.id}` : `/cursos/${course.slug}`}
        className="group relative block"
        aria-label="Ver vista previa del curso"
      >
        <Cover fileKey={course.coverKey} alt="" />
        {firstPreview && (
          <span className="absolute inset-0 flex flex-col items-center justify-center bg-ink-900/40 text-white transition group-hover:bg-ink-900/55">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink-900 shadow-lg">
              <PlayCircle className="h-9 w-9" aria-hidden />
            </span>
            <span className="mt-2 text-sm font-semibold">Vista previa de este curso</span>
          </span>
        )}
      </Link>
      <div className="space-y-4 p-6">
        {state && (
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">Su progreso</span>
              <span>{progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        )}
        {cta}
        {!user && (
          <p className="text-center text-xs text-ink-500">
            ¿Ya tiene cuenta?{" "}
            <Link
              href={`/ingresar?volver=${encodeURIComponent(`/cursos/${course.slug}`)}`}
              className="font-semibold text-brand-700 underline"
            >
              Ingrese aquí
            </Link>
          </p>
        )}
        <div>
          <p className="mb-2 font-bold text-ink-900">Este curso incluye:</p>
          <ul className="space-y-2 text-sm text-ink-700">
            {includes.map((i) => (
              <li key={i.text} className="flex items-center gap-3">
                <i.icon className="h-4 w-4 shrink-0 text-ink-900" aria-hidden /> {i.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative">
        {/* Banda superior */}
        <section className="bg-ink-900 text-white">
          <Container className="relative py-8 lg:py-10">
            <div className="border-l-8 border-brand-500 pl-6 lg:mr-[380px] lg:pr-10">
              <nav
                aria-label="Ruta"
                className="flex flex-wrap items-center gap-1 text-sm font-semibold text-brand-500"
              >
                <Link href="/cursos" className="hover:underline">
                  Cursos
                </Link>
                <ChevronRight className="h-4 w-4" aria-hidden />
                <Link href={`/cursos?categoria=${course.category.slug}`} className="hover:underline">
                  {course.category.name}
                </Link>
              </nav>
              <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{course.title}</h1>
              <p className="mt-3 text-lg text-ink-200">{course.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {course.featured && <Badge tone="brand">Destacado</Badge>}
                <span className="flex items-center gap-1.5 text-ink-200">
                  <Users className="h-4 w-4" aria-hidden /> {course._count.enrollments} inscritos
                </span>
                <span className="text-ink-200">Nivel {LEVELS[course.level].toLowerCase()}</span>
              </div>
              {course.instructor && (
                <p className="mt-3 text-sm text-ink-200">
                  Instructor:{" "}
                  <a href="#instructor" className="font-semibold text-brand-500 underline underline-offset-2">
                    {course.instructor.name}
                  </a>
                </p>
              )}
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-200">
                <span>Última actualización: {monthYear(course.updatedAt)}</span>
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" aria-hidden /> Español
                </span>
              </p>
              {course.sponsors.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-200">
                  Con el apoyo de
                  {course.sponsors.map((s) => (
                    <Link
                      key={s.id}
                      href={`/marcas/${s.slug}`}
                      className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 hover:bg-white/20"
                    >
                      <Logo fileKey={s.logoKey} alt="" className="h-6 w-6 rounded-full" />
                      <span className="font-medium text-white">{s.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Container>
        </section>

        {/* Tarjeta del curso: en flujo en móvil, fija a la derecha en desktop */}
        <Container className="mt-6 lg:hidden">{sideCard}</Container>
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <Container className="relative h-full">
            <aside className="pointer-events-auto absolute right-6 top-10 h-[calc(100%-2.5rem)] w-[350px]">
              <div className="sticky top-24">{sideCard}</div>
            </aside>
          </Container>
        </div>

        <Container>
          {/* Columna principal */}
          <div className="space-y-10 py-8 lg:mr-[380px] lg:py-10">
            {completado && state?.certificate && (
              <Alert tone="success">
                <strong>¡Felicitaciones!</strong> Completó el curso.{" "}
                <Link href={`/certificados/${state.certificate.code}`} className="font-medium underline">
                  Descargue su certificado
                </Link>
                .
              </Alert>
            )}

            {course.outcomes.length > 0 && (
              <section className="rounded-md border border-ink-200 bg-white p-6">
                <h2 className="mb-4 text-2xl font-bold">Lo que aprenderá</h2>
                <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {course.outcomes.map((o) => (
                    <li key={o} className="flex gap-3 text-sm text-ink-800">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink-900" aria-hidden /> {o}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Curriculum course={course} state={state} />

            {course.requirements.length > 0 && (
              <section>
                <h2 className="mb-3 text-2xl font-bold">Requisitos</h2>
                <ul className="list-disc space-y-1 pl-5 text-sm text-ink-800">
                  {course.requirements.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </section>
            )}

            {course.description && (
              <section>
                <h2 className="mb-3 text-2xl font-bold">Descripción</h2>
                <Expandable>
                  <div
                    className="prose-acacons text-ink-700"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(course.description) }}
                  />
                </Expandable>
              </section>
            )}

            {course.instructor && (
              <section id="instructor" className="scroll-mt-24">
                <h2 className="mb-3 text-2xl font-bold">Instructor</h2>
                <p className="text-lg font-bold text-brand-700">{course.instructor.name}</p>
                {course.instructor.title && <p className="text-ink-600">{course.instructor.title}</p>}
                <div className="mt-3 flex items-center gap-4 text-sm text-ink-700">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-900 text-xl font-bold text-white">
                    {course.instructor.name
                      .replace(/^(Ing|Arq|Téc|Lic)\.\s*/, "")
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span>Instructor de La Academia del Constructor</span>
                </div>
                {course.instructor.bio && (
                  <p className="mt-3 text-sm text-ink-700">{course.instructor.bio}</p>
                )}
              </section>
            )}

            {course.technicalSheets.length > 0 && (
              <section>
                <h2 className="mb-3 text-2xl font-bold">Fichas técnicas</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {course.technicalSheets.map((s) => (
                    <li key={s.id}>
                      <a
                        href={fileUrl(s.fileKey, `${s.title}.pdf`)!}
                        className="group flex items-start gap-3 rounded-md border border-ink-200 bg-white p-4 text-sm hover:border-ink-900"
                      >
                        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
                        <span className="flex-1">
                          <span className="font-medium group-hover:underline">{s.title}</span>
                          <span className="block text-xs text-ink-500">
                            {s.brand.name} · PDF {s.fileSize ? `· ${formatBytes(s.fileSize)}` : ""}
                          </span>
                        </span>
                        <Download className="h-4 w-4 text-ink-400" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </Container>
      </div>

      {related.length > 0 && (
        <Container className="pb-10">
          <h2 className="mb-4 text-2xl font-bold">Más cursos de {course.category.name.toLowerCase()}</h2>
          <Carousel label={`Más cursos de ${course.category.name}`}>
            {related.map((c) => (
              <CarouselItem key={c.id}>
                <CourseCard course={c} />
              </CarouselItem>
            ))}
          </Carousel>
        </Container>
      )}

      {/* CTA fijo en móvil */}
      {!state?.certificate && <div className="h-20 lg:hidden" aria-hidden />}
      {!state?.certificate && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white p-3 shadow-[0_-4px_12px_rgba(44,44,42,0.12)] lg:hidden">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <p className="line-clamp-2 flex-1 text-sm font-semibold">{course.title}</p>
            <div className="shrink-0 [&_a]:whitespace-nowrap [&_a]:px-4 [&_button]:whitespace-nowrap [&_button]:px-4">
              {cta}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
