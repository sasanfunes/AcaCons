import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import { getCourseBySlug, getLessonForPlayer, getUserCourseState, lessonOrder } from "@/server/queries/courses";
import { getOptionalUser } from "@/server/guards";
import { enrollAction, toggleLessonAction } from "@/server/actions/learning";
import { formatBytes } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { fileUrl } from "@/lib/storage/url";
import { VideoPlayer } from "@/components/course/video-player";
import { PlayerCurriculum } from "@/components/player/player-curriculum";
import { PlayerTabs } from "@/components/player/player-tabs";
import { QaPanel } from "@/components/player/qa-panel";
import { ButtonLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/misc";

export async function generateMetadata({ params }: PageProps<"/cursos/[slug]/leccion/[lessonId]">): Promise<Metadata> {
  const lesson = await getLessonForPlayer((await params).lessonId);
  return lesson ? { title: lesson.title } : {};
}

export default async function LessonPage({ params, searchParams }: PageProps<"/cursos/[slug]/leccion/[lessonId]">) {
  const { slug, lessonId } = await params;
  const { tab } = await searchParams;
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
  const finalQuiz = course.quizzes[0];
  const nextHref = next ? `/cursos/${slug}/leccion/${next.id}` : finalQuiz ? `/cursos/${slug}/evaluacion/${finalQuiz.id}` : `/cursos/${slug}`;
  const canParticipate = !!state || user?.role === "ADMIN";

  const overview = (
    <div className="max-w-3xl">
      <p className="kicker text-brand-700">{lesson.module.title}</p>
      <h1 className="mt-1 text-2xl font-bold">{lesson.title}</h1>
      {state && (
        <form action={toggleLessonAction} className="mt-4">
          <input type="hidden" name="lessonId" value={lesson.id} />
          <input type="hidden" name="done" value={done ? "0" : "1"} />
          <input type="hidden" name="next" value={nextHref} />
          {done ? (
            <SubmitButton variant="outline" pendingText="Guardando…">
              <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden /> Completada · desmarcar
            </SubmitButton>
          ) : (
            <SubmitButton variant="accent" pendingText="Guardando…">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Marcar como completada{next ? " y seguir" : ""}
            </SubmitButton>
          )}
        </form>
      )}
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
              Cree su cuenta
            </Link>
          )}{" "}
          para acceder a todo el curso y obtener el certificado.
        </Alert>
      )}
      {lesson.content && <div className="prose-acacons mt-6 text-ink-700" dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.content) }} />}
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
  );

  const resources =
    course.technicalSheets.length === 0 ? (
      <p className="text-sm text-ink-600">Este curso no tiene recursos descargables.</p>
    ) : (
      <ul className="max-w-2xl divide-y divide-ink-200 border-y border-ink-200">
        {course.technicalSheets.map((s) => (
          <li key={s.id}>
            <a href={fileUrl(s.fileKey, `${s.title}.pdf`)!} className="group flex items-center gap-3 py-3 text-sm">
              <FileText className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
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
    );

  const curriculum = <PlayerCurriculum course={course} state={state} currentLessonId={lesson.id} />;

  return (
    <div className="lg:flex">
      <div className="min-w-0 flex-1">
        <div className="bg-black">
          <div className="mx-auto max-w-[1100px]">
            <VideoPlayer provider={lesson.videoProvider} videoId={lesson.videoId} hash={lesson.videoHash} title={lesson.title} />
          </div>
        </div>
        <PlayerTabs
          initial={typeof tab === "string" ? tab : undefined}
          tabs={[
            { id: "contenido", label: "Contenido del curso", content: curriculum, mobileOnly: true },
            { id: "descripcion", label: "Descripción general", content: overview },
            { id: "preguntas", label: "Preguntas y respuestas", content: <QaPanel lessonId={lesson.id} canParticipate={canParticipate} /> },
            { id: "recursos", label: "Recursos", content: resources },
          ]}
        />
      </div>
      <aside className="hidden w-[360px] shrink-0 border-l border-ink-200 lg:block" aria-label="Contenido del curso">
        <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <p className="border-b border-ink-200 px-4 py-3 font-bold">Contenido del curso</p>
          {curriculum}
        </div>
      </aside>
    </div>
  );
}
