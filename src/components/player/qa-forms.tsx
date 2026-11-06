"use client";
import { useActionState, useEffect, useRef } from "react";
import { answerQuestionAction, askQuestionAction } from "@/server/actions/qa";
import { initialState } from "@/lib/validation/action";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";

export function AskQuestionForm({ lessonId }: { lessonId: string }) {
  const [state, action] = useActionState(askQuestionAction, initialState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  const e = state.fieldErrors ?? {};
  return (
    <form ref={ref} action={action} className="space-y-3">
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <input type="hidden" name="lessonId" value={lessonId} />
      <Field label="Título o resumen" htmlFor="qa-title" error={e.title}>
        <Input id="qa-title" name="title" placeholder="Ej.: ¿Qué traslape usar en losas con poca pendiente?" required />
      </Field>
      <Field label="Detalle (opcional en obra: medidas, materiales, fotos descritas)" htmlFor="qa-body" error={e.body}>
        <Textarea id="qa-body" name="body" rows={4} required />
      </Field>
      <SubmitButton pendingText="Publicando…">Publicar pregunta</SubmitButton>
    </form>
  );
}

export function AnswerForm({ questionId, compact }: { questionId: string; compact?: boolean }) {
  const [state, action] = useActionState(answerQuestionAction, initialState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-2">
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      <input type="hidden" name="questionId" value={questionId} />
      <Textarea name="body" rows={compact ? 2 : 3} placeholder="Escriba una respuesta…" aria-label="Respuesta" required />
      {state.fieldErrors?.body && <p className="text-xs text-red-600">{state.fieldErrors.body[0]}</p>}
      <SubmitButton size="sm" variant="secondary" pendingText="Publicando…">
        Responder
      </SubmitButton>
    </form>
  );
}
