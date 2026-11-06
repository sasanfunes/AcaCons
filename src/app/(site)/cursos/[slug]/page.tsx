import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BookOpen, Clock, Download, FileText, Signal, Users } from "lucide-react";
import { getCourseBySlug, getUserCourseState, lessonOrder } from "@/server/queries/courses";
import { getOptionalUser } from "@/server/guards";
import { enrollAction } from "@/server/actions/learning";
import { courseProgress, nextPendingLesson } from "@/lib/domain/progress";
import { LEVELS } from "@/lib/constants";
import { formatBytes, formatDuration } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { fileUrl } from "@/lib/storage/url";
import { Syllabus } from "@/components/course/syllabus";
import { Cover, Logo } from "@/components/ui/cover";
import { ButtonLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert, Badge, Card, Container, ProgressBar } from "@/components/ui/misc";

export async function generateMetadata({ params }: PageProps<"/cursos/[slug]">): Promise<Metadata> {
  const course = await getCourseBySlug((await params).slug);
  return course ? { title: course.title, description: course.summary } : {};
}

export default async function CoursePage({ params, searchParams }: PageProps<"/cursos/[slug]">) {
  const { slug } = await params;
  const { completado } = await searchParams;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  const user = await getOptionalUser();
  const state = await getUserCourseState(user?.id, course.id);
  const lessons = lessonOrder(course);
  const lessonIds = lessons.map((l) => l.id);
  const progress = state ? courseProgress(lessonIds, state.completedIds) : 0;
  const nextLesson = state ? nextPendingLesson(lessonIds, state.completedIds) : null;
  const allLessonsDone = state ? lessonIds.every((id) => state.completedIds.has(id)) : false;
  const pendingFinal = course.quizzes.find((q) => q.required && !state?.bestByQuiz.get(q.id)?.passed);
  const firstPreview = lessons.find((l) => l.isPreview);

  return (
    <>
      <section className="bg-ink-900 text-white">
        <Container className="grid gap-8 py-10 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="border-l-8 border-brand-500 pl-6">
            <nav aria-label="Ruta" className="kicker mb-3 text-brand-500">
              <Link href="/cursos" className="hover:text-white">
                Cursos
              </Link>{" "}
              /{" "}
              <Link href={`/cursos?categoria=${course.category.slug}`} className="hover:text-white">
                {course.category.name}
              </Link>
            </nav>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{course.title}</h1>
            <p className="mt-3 text-lg text-ink-300">{course.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-300">
              <li className="flex items-center gap-1.5">
                <Signal className="h-4 w-4" aria-hidden /> Nivel {LEVELS[course.level].toLowerCase()}
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden /> {formatDuration(course.estimatedMinutes)}
              </li>
              <li className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" aria-hidden /> {lessons.length} lecciones
              </li>
              <li className="flex items-center gap-1.5">
                <Users className="h-4 w-4" aria-hidden /> {course._count.enrollments} inscritos
              </li>
              <li className="flex items-center gap-1.5">
                <Award className="h-4 w-4" aria-hidden /> Certificado al aprobar
              </li>
            </ul>
            {course.sponsors.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-300">
                Con el apoyo de
                {course.sponsors.map((s) => (
                  <Link key={s.id} href={`/marcas/${s.slug}`} className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 hover:bg-white/20">
                    <Logo fileKey={s.logoKey} alt="" className="h-6 w-6 rounded-full" />
                    <span className="font-medium text-white">{s.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Card className="overflow-hidden text-ink-900">
            <Cover fileKey={course.coverKey} alt="" />
            <div className="space-y-3 p-5">
              {state ? (
                <>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">Su progreso</span>
                      <span>{progress}%</span>
                    </div>
                    <ProgressBar value={progress} />
                  </div>
                  {state.certificate ? (
                    <ButtonLink href={`/certificados/${state.certificate.code}`} className="w-full">
                      <Award className="h-4 w-4" aria-hidden /> Ver mi certificado
                    </ButtonLink>
                  ) : allLessonsDone && pendingFinal ? (
                    <ButtonLink href={`/cursos/${course.slug}/evaluacion/${pendingFinal.id}`} className="w-full">
                      Rendir evaluación final
                    </ButtonLink>
                  ) : nextLesson ? (
                    <ButtonLink href={`/cursos/${course.slug}/leccion/${nextLesson}`} className="w-full">
                      {progress === 0 ? "Comenzar curso" : "Continuar curso"}
                    </ButtonLink>
                  ) : null}
                </>
              ) : user ? (
                <form action={enrollAction}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <SubmitButton className="w-full" size="lg" variant="accent" pendingText="Inscribiendo…">
                    Inscribirme gratis
                  </SubmitButton>
                </form>
              ) : (
                <ButtonLink href={`/registro?volver=${encodeURIComponent(`/cursos/${course.slug}`)}`} className="w-full" size="lg" variant="accent">
                  Inscribirme gratis
                </ButtonLink>
              )}
              {!state && firstPreview && (
                <ButtonLink href={`/cursos/${course.slug}/leccion/${firstPreview.id}`} variant="outline" className="w-full">
                  Ver lección de muestra
                </ButtonLink>
              )}
              {!user && (
                <p className="text-center text-xs text-ink-500">
                  ¿Ya tiene cuenta?{" "}
                  <Link href={`/ingresar?volver=${encodeURIComponent(`/cursos/${course.slug}`)}`} className="text-brand-700 underline">
                    Ingrese aquí
                  </Link>
                </p>
              )}
            </div>
          </Card>
        </Container>
      </section>

      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          {completado && state?.certificate && (
            <Alert tone="success">
              <strong>¡Felicitaciones!</strong> Completó el curso.{" "}
              <Link href={`/certificados/${state.certificate.code}`} className="font-medium underline">
                Descargue su certificado
              </Link>
              .
            </Alert>
          )}
          {course.description && (
            <section>
              <h2 className="mb-3 text-xl font-bold">Sobre este curso</h2>
              <div className="prose-acacons text-ink-700" dangerouslySetInnerHTML={{ __html: renderMarkdown(course.description) }} />
            </section>
          )}
          <section>
            <h2 className="mb-3 text-xl font-bold">Temario</h2>
            <Syllabus course={course} state={state} />
          </section>
        </div>
        <aside className="space-y-6">
          {course.instructor && (
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-500">Instructor</h2>
              <p className="font-semibold">{course.instructor.name}</p>
              {course.instructor.title && <p className="text-sm text-ink-600">{course.instructor.title}</p>}
              {course.instructor.bio && <p className="mt-2 text-sm text-ink-700">{course.instructor.bio}</p>}
            </Card>
          )}
          {course.technicalSheets.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-500">Fichas técnicas</h2>
              <ul className="space-y-3">
                {course.technicalSheets.map((s) => (
                  <li key={s.id}>
                    <a
                      href={fileUrl(s.fileKey, `${s.title}.pdf`)!}
                      className="group flex items-start gap-3 text-sm"
                    >
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
                      <span className="flex-1">
                        <span className="font-medium group-hover:text-brand-700">{s.title}</span>
                        <span className="block text-xs text-ink-500">
                          {s.brand.name} · PDF {s.fileSize ? `· ${formatBytes(s.fileSize)}` : ""}
                        </span>
                      </span>
                      <Download className="h-4 w-4 text-ink-400 group-hover:text-brand-700" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card className="p-5 text-sm text-ink-700">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-500">Cómo se aprueba</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Vea todas las lecciones y márquelas como completadas.</li>
              {course.quizzes.filter((q) => q.required).map((q) => (
                <li key={q.id}>
                  Apruebe “{q.title}” con {q.passingScore}% o más ({q._count.questions} preguntas).
                </li>
              ))}
              <li>
                Descargue su certificado digital. <Badge tone="success">Gratis</Badge>
              </li>
            </ul>
          </Card>
        </aside>
      </Container>
    </>
  );
}
