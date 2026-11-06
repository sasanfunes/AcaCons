"use client";
import Link from "next/link";
import { useActionState } from "react";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { submitQuizAction, type QuizActionState } from "@/server/actions/learning";
import { ButtonLink, Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert, Card } from "@/components/ui/misc";
import { cn } from "@/lib/cn";

type Question = { id: string; prompt: string; options: { id: string; text: string }[] };

export function QuizForm({
  quizId,
  questions,
  passingScore,
  courseSlug,
  isFinal,
}: {
  quizId: string;
  questions: Question[];
  passingScore: number;
  courseSlug: string;
  isFinal: boolean;
}) {
  const [state, action] = useActionState<QuizActionState, FormData>(submitQuizAction, {});
  const result = state.result;
  const review = result ? new Map(result.perQuestion.map((p) => [p.questionId, p])) : null;

  return (
    <div className="space-y-6">
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {result && (
        <Card className={cn("p-5", result.passed ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50")} role="status">
          <p className="text-lg font-bold">
            {result.passed ? "¡Aprobado!" : "No alcanzó el puntaje mínimo"} — {result.score}%
          </p>
          <p className="text-sm text-ink-700">
            Respondió correctamente {result.correctCount} de {result.total} preguntas. Puntaje mínimo: {passingScore}%.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {state.certificateCode ? (
              <ButtonLink href={`/certificados/${state.certificateCode}`}>
                <Award className="h-4 w-4" aria-hidden /> Ver mi certificado
              </ButtonLink>
            ) : result.passed ? (
              <ButtonLink href={`/cursos/${courseSlug}`}>Volver al curso</ButtonLink>
            ) : null}
            {!result.passed && (
              <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                Intentar de nuevo
              </Button>
            )}
            {result.passed && isFinal && !state.certificateCode && (
              <p className="text-sm text-ink-700">
                Para obtener el certificado complete todas las lecciones del{" "}
                <Link href={`/cursos/${courseSlug}`} className="underline">
                  curso
                </Link>
                .
              </p>
            )}
          </div>
        </Card>
      )}
      <form action={action} className="space-y-5">
        <input type="hidden" name="quizId" value={quizId} />
        {questions.map((q, i) => {
          const r = review?.get(q.id);
          return (
            <fieldset key={q.id} className="rounded-lg border border-ink-200 bg-white p-5" disabled={!!result}>
              <legend className="sr-only">Pregunta {i + 1}</legend>
              <p className="mb-3 font-medium">
                {i + 1}. {q.prompt}
              </p>
              <div className="space-y-2">
                {q.options.map((o) => {
                  const selected = r?.selectedOptionId === o.id;
                  const correct = r?.correctOptionId === o.id;
                  return (
                    <label
                      key={o.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm",
                        r && correct ? "border-green-400 bg-green-50" : r && selected ? "border-red-300 bg-red-50" : "border-ink-200 hover:bg-ink-50",
                      )}
                    >
                      <input type="radio" name={`q_${q.id}`} value={o.id} className="accent-brand-600" required defaultChecked={selected} />
                      <span className="flex-1">{o.text}</span>
                      {r && correct && <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="Respuesta correcta" />}
                      {r && selected && !correct && <XCircle className="h-4 w-4 text-red-600" aria-label="Su respuesta" />}
                    </label>
                  );
                })}
              </div>
              {r && state.explanations?.[q.id] && <p className="mt-3 text-sm text-ink-600">💡 {state.explanations[q.id]}</p>}
            </fieldset>
          );
        })}
        {!result && (
          <SubmitButton size="lg" pendingText="Calificando…">
            Enviar respuestas
          </SubmitButton>
        )}
      </form>
    </div>
  );
}
