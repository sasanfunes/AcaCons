import { MessageSquare } from "lucide-react";
import { listLessonQuestions } from "@/server/services/qa";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/misc";
import { AnswerForm, AskQuestionForm } from "./qa-forms";

const initials = (n: string) =>
  n
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Pestaña "Preguntas y respuestas" de una lección. */
export async function QaPanel({ lessonId, canParticipate }: { lessonId: string; canParticipate: boolean }) {
  const questions = await listLessonQuestions(lessonId);
  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-1 text-lg font-bold">Preguntas de esta lección ({questions.length})</h3>
        <p className="mb-4 text-sm text-ink-600">El equipo académico responde las consultas técnicas en un plazo de 2 días hábiles.</p>
        {questions.length === 0 ? (
          <div className="rounded-md border border-dashed border-ink-300 p-6 text-center text-sm text-ink-600">
            <MessageSquare className="mx-auto mb-2 h-6 w-6 text-ink-400" aria-hidden />
            Todavía no hay preguntas. Sea el primero en consultar.
          </div>
        ) : (
          <ul className="divide-y divide-ink-200 border-y border-ink-200">
            {questions.map((q) => (
              <li key={q.id} className="py-4">
                <details className="group">
                  <summary className="flex cursor-pointer list-none gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
                      {initials(q.user.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink-900">{q.title}</span>
                      <span className="line-clamp-2 block text-sm text-ink-700 group-open:line-clamp-none">{q.body}</span>
                      <span className="mt-1 block text-xs text-ink-500">
                        {q.user.name} · {formatDate(q.createdAt)} ·{" "}
                        <span className="font-semibold text-brand-700">
                          {q.answers.length} {q.answers.length === 1 ? "respuesta" : "respuestas"}
                        </span>
                      </span>
                    </span>
                  </summary>
                  <div className="ml-13 mt-3 space-y-3 border-l-2 border-ink-200 pl-4 sm:ml-[3.25rem]">
                    {q.answers.map((a) => (
                      <div key={a.id} className={a.isStaff ? "rounded-md bg-brand-50 p-3" : "p-1"}>
                        <p className="text-xs text-ink-500">
                          <span className="font-semibold text-ink-900">{a.user.name}</span>
                          {a.isStaff && (
                            <Badge tone="brand" className="ml-2">
                              Equipo académico
                            </Badge>
                          )}{" "}
                          · {formatDate(a.createdAt)}
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm text-ink-800">{a.body}</p>
                      </div>
                    ))}
                    {canParticipate && <AnswerForm questionId={q.id} compact />}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
      {canParticipate && (
        <section className="rounded-md border border-ink-200 bg-white p-5">
          <h3 className="mb-3 text-lg font-bold">Hacer una pregunta</h3>
          <AskQuestionForm lessonId={lessonId} />
        </section>
      )}
    </div>
  );
}
