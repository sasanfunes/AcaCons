import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCourseBySlug, getQuizForTaking, getUserCourseState } from "@/server/queries/courses";
import { requireUser } from "@/server/guards";
import { QuizForm } from "@/components/course/quiz-form";
import { PlayerCurriculum } from "@/components/player/player-curriculum";
import { Alert } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Evaluación" };

export default async function QuizPage({ params }: PageProps<"/cursos/[slug]/evaluacion/[quizId]">) {
  const { slug, quizId } = await params;
  const user = await requireUser(`/cursos/${slug}/evaluacion/${quizId}`);
  const [course, quiz] = await Promise.all([getCourseBySlug(slug), getQuizForTaking(quizId)]);
  if (!course || !quiz || quiz.courseId !== course.id) notFound();
  const state = await getUserCourseState(user.id, course.id);
  if (!state) redirect(`/cursos/${slug}`);
  const best = state.bestByQuiz.get(quiz.id);

  return (
    <div className="lg:flex">
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="kicker text-brand-700">{quiz.module ? "Repaso de módulo" : "Evaluación final"}</p>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="mt-1 text-ink-600">
            {quiz.module ? `Repaso del módulo “${quiz.module.title}”. ` : "Evaluación final del curso. "}
            {quiz.questions.length} preguntas · puntaje mínimo {quiz.passingScore}%
            {quiz.required ? "" : " · opcional"}
          </p>
          {best && (
            <Alert tone={best.passed ? "success" : "info"} className="mt-4">
              Su mejor resultado hasta ahora: <strong>{best.score}%</strong>
              {best.passed ? " (aprobado)" : ""}. Puede volver a intentarlo cuando quiera.
            </Alert>
          )}
          <div className="mt-6">
            {quiz.questions.length === 0 ? (
              <Alert>Esta evaluación todavía no tiene preguntas.</Alert>
            ) : (
              <QuizForm
                quizId={quiz.id}
                questions={quiz.questions}
                passingScore={quiz.passingScore}
                courseSlug={slug}
                isFinal={!quiz.moduleId}
              />
            )}
          </div>
        </div>
      </div>
      <aside
        className="hidden w-[360px] shrink-0 border-l border-ink-200 lg:block"
        aria-label="Contenido del curso"
      >
        <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <p className="border-b border-ink-200 px-4 py-3 font-bold">Contenido del curso</p>
          <PlayerCurriculum course={course} state={state} currentQuizId={quiz.id} />
        </div>
      </aside>
    </div>
  );
}
