import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { getCourseBySlug, getLessonForPlayer, getUserCourseState, lessonOrder } from "@/server/queries/courses";
import { getOptionalUser } from "@/server/guards";
import { enrollAction, toggleLessonAction } from "@/server/actions/learning";
import { courseProgress } from "@/lib/domain/progress";
import { renderMarkdown } from "@/lib/markdown";
import { Syllabus } from "@/components/course/syllabus";
import { VideoPlayer } from "@/components/course/video-player";
import { ButtonLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert, Container, ProgressBar } from "@/components/ui/misc";

export async function generateMetadata({ params }: PageProps<"/cursos/[slug]/leccion/[lessonId]">): Promise<Metadata> {
  const lesson = await getLessonForPlayer((await params).lessonId);
  return lesson ? { title: lesson.title } : {};
}

export default async function LessonPage({ params }: PageProps<"/cursos/[slug]/leccion/[lessonId]">) {
  const { slug, lessonId } = await params;
  const [course, lesson, user] = await Promise.all([getCourseBySlug(slug), getLessonForPlayer(lessonId), getOptionalUser()]);
  if (!course || !lesson || lesson.module.courseId !== course.id) notFound();
  const state = await getUserCourseState(user?.id, course.id);
  if (!state && !lesson.isPreview) {
    redirect(user ? `/cursos/${slug}` : `/ingresar?volver=${encodeURIComponent(`/cursos/${slug}/leccion/${lessonId}`)}`);
  }

  const lessons = lessonOrder(course);
  const idx = lessons.findIndex((l) => l.id === lesson.id);
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const done = state?.completedIds.has(lesson.id) ?? false;
  const progress = state ? courseProgress(lessons.map((l) => l.id), state.completedIds) : 0;
  const moduleQuiz = course.modules.find((m) => m.id === lesson.moduleId)?.quizzes[0];
  const isLastInModule = !next || next.moduleTitle !== lessons[idx]?.moduleTitle;
  const finalQuiz = course.quizzes[0];
  const nextHref = next
    ? `/cursos/${slug}/leccion/${next.id}`
    : finalQuiz
      ? `/cursos/${slug}/evaluacion/${finalQuiz.id}`
      : `/cursos/${slug}`;

  return (
    <Container className="grid gap-8 py-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <nav aria-label="Ruta" className="mb-3 text-sm text-ink-600">
          <Link href={`/cursos/${slug}`} className="hover:text-brand-700">
            ← {course.title}
          </Link>
        </nav>
        <VideoPlayer provider={lesson.videoProvider} videoId={lesson.videoId} hash={lesson.videoHash} title={lesson.title} />
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-ink-500">{lesson.module.title}</p>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
          </div>
          {state && (
            <form action={toggleLessonAction} className="shrink-0">
              <input type="hidden" name="lessonId" value={lesson.id} />
              <input type="hidden" name="done" value={done ? "0" : "1"} />
              <input type="hidden" name="next" value={nextHref} />
              {done ? (
                <SubmitButton variant="outline" pendingText="Guardando…">
                  <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden /> Completada · desmarcar
                </SubmitButton>
              ) : (
                <SubmitButton pendingText="Guardando…">
                  <CheckCircle2 className="h-4 w-4" aria-hidden /> Marcar como completada{next ? " y seguir" : ""}
                </SubmitButton>
              )}
            </form>
          )}
        </div>

        {!state && (
          <Alert className="mt-4">
            Está viendo una lección de muestra.{" "}
            {user ? (
              <form action={enrollAction} className="inline">
                <input type="hidden" name="courseId" value={course.id} />
                <button className="font-medium underline">Inscríbase gratis</button>
              </form>
            ) : (
              <Link href={`/registro?volver=${encodeURIComponent(`/cursos/${slug}`)}`} className="font-medium underline">
                Cree su cuenta gratis
              </Link>
            )}{" "}
            para acceder a todo el curso y obtener el certificado.
          </Alert>
        )}

        {lesson.content && (
          <div className="prose-acacons mt-6 text-ink-700" dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.content) }} />
        )}

        {state && isLastInModule && moduleQuiz && (
          <Alert className="mt-6">
            Al terminar este módulo puede repasar con{" "}
            <Link href={`/cursos/${slug}/evaluacion/${moduleQuiz.id}`} className="font-medium underline">
              {moduleQuiz.title}
            </Link>
            .
          </Alert>
        )}

        <div className="mt-8 flex justify-between gap-4 border-t border-ink-200 pt-4">
          {prev && (state || prev.isPreview) ? (
            <ButtonLink href={`/cursos/${slug}/leccion/${prev.id}`} variant="ghost">
              <ChevronLeft className="h-4 w-4" aria-hidden /> Anterior
            </ButtonLink>
          ) : (
            <span />
          )}
          {state && (
            <ButtonLink href={nextHref} variant="ghost">
              {next ? "Siguiente" : finalQuiz ? "Ir a la evaluación final" : "Volver al curso"}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
        {state && (
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">Progreso del curso</span>
              <span>{progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        )}
        <Syllabus course={course} state={state} currentLessonId={lesson.id} compact />
      </aside>
    </Container>
  );
}
