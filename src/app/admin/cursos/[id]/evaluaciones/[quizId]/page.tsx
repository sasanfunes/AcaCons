import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deleteQuestionAction, deleteQuizAction } from "@/server/actions/admin";
import { QuestionForm, QuizSettingsForm } from "@/components/admin/course-forms";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Card, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Editar evaluación" };

export default async function QuizEditor({ params }: PageProps<"/admin/cursos/[id]/evaluaciones/[quizId]">) {
  const { id, quizId } = await params;
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      course: { select: { id: true, title: true, modules: { orderBy: { position: "asc" }, select: { id: true, title: true } } } },
      questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } },
    },
  });
  if (!quiz || quiz.courseId !== id) notFound();
  return (
    <>
      <Link href={`/admin/cursos/${id}`} className="text-sm text-ink-600 hover:text-brand-700">
        ← {quiz.course.title}
      </Link>
      <PageHeader
        title={quiz.title}
        actions={
          <form action={deleteQuizAction}>
            <input type="hidden" name="id" value={quiz.id} />
            <ConfirmButton message="¿Eliminar la evaluación y todos sus intentos?" className="text-red-700">
              <Trash2 className="h-4 w-4" aria-hidden /> Eliminar evaluación
            </ConfirmButton>
          </form>
        }
      />
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 font-bold">Configuración</h2>
          <QuizSettingsForm courseId={id} modules={quiz.course.modules.map((m) => ({ id: m.id, name: m.title }))} quiz={quiz} />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-bold">Preguntas ({quiz.questions.length})</h2>
          <ol className="space-y-3">
            {quiz.questions.map((q, i) => (
              <li key={q.id} className="rounded-md border border-ink-200">
                <details>
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm">
                    <span className="font-medium">
                      {i + 1}. {q.prompt}
                    </span>
                    <span className="mt-1 block text-xs text-ink-500">
                      Correcta: {q.options.find((o) => o.isCorrect)?.text ?? "—"} · {q.options.length} opciones
                    </span>
                  </summary>
                  <div className="border-t border-ink-200 p-4">
                    <QuestionForm quizId={quiz.id} question={q} />
                    <form action={deleteQuestionAction} className="mt-3 border-t border-ink-100 pt-3">
                      <input type="hidden" name="id" value={q.id} />
                      <ConfirmButton message="¿Eliminar esta pregunta?" className="text-red-700">
                        <Trash2 className="h-4 w-4" aria-hidden /> Eliminar pregunta
                      </ConfirmButton>
                    </form>
                  </div>
                </details>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-lg border border-dashed border-ink-300 p-4">
            <h3 className="mb-3 text-sm font-semibold">Nueva pregunta</h3>
            <QuestionForm quizId={quiz.id} />
          </div>
        </Card>
      </div>
    </>
  );
}
