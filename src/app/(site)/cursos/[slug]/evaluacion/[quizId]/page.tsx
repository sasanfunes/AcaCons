import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCourseBySlug, getQuizForTaking, getUserCourseState } from "@/server/queries/courses";
import { requireUser } from "@/server/guards";
import { QuizForm } from "@/components/course/quiz-form";
import { Syllabus } from "@/components/course/syllabus";
import { Alert, Container } from "@/components/ui/misc";

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
    <Container className="grid gap-8 py-8 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <nav aria-label="Ruta" className="mb-3 text-sm text-ink-600">
          <Link href={`/cursos/${slug}`} className="hover:text-brand-700">
            ← {course.title}
          </Link>
        </nav>
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
      <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
        <Syllabus course={course} state={state} currentQuizId={quiz.id} compact />
      </aside>
    </Container>
  );
}
