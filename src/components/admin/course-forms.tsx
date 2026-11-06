"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  saveCourseAction,
  saveLessonAction,
  saveModuleAction,
  saveQuestionAction,
  saveQuizAction,
} from "@/server/actions/admin";
import { initialState, type ActionState } from "@/lib/validation/action";
import { LEVELS, STATUS_LABELS } from "@/lib/constants";
import { parseVideoUrl, embedUrl } from "@/lib/domain/video";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormFeedback } from "./form-feedback";

type Opt = { id: string; name: string };

/** Limpia el formulario tras crear un elemento nuevo. */
function useResetOnSuccess(state: ActionState, enabled: boolean) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (enabled && state.ok) ref.current?.reset();
  }, [state, enabled]);
  return ref;
}

export type CourseFormValues = {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  description?: string;
  level?: string;
  estimatedMinutes?: number;
  categoryId?: string;
  instructorId?: string | null;
  status?: string;
  featured?: boolean;
  sponsorIds?: string[];
  sheetIds?: string[];
};

export function CourseForm({
  course,
  categories,
  instructors,
  brands,
  sheets,
}: {
  course?: CourseFormValues;
  categories: Opt[];
  instructors: Opt[];
  brands: Opt[];
  sheets: { id: string; name: string; brand: string }[];
}) {
  const [state, action] = useActionState(saveCourseAction, initialState);
  const e = state.fieldErrors ?? {};
  const c = course ?? {};
  return (
    <form action={action} className="space-y-4" encType="multipart/form-data">
      <FormFeedback state={state} />
      {c.id && <input type="hidden" name="id" value={c.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título" htmlFor="title" error={e.title}>
          <Input id="title" name="title" defaultValue={c.title} required />
        </Field>
        <Field label="Slug (URL)" htmlFor="slug" error={e.slug} hint="Se genera a partir del título si lo deja vacío.">
          <Input id="slug" name="slug" defaultValue={c.slug} placeholder="concreto-en-obra" />
        </Field>
      </div>
      <Field label="Resumen" htmlFor="summary" error={e.summary} hint="Una o dos frases que aparecen en el catálogo.">
        <Textarea id="summary" name="summary" defaultValue={c.summary} rows={2} required />
      </Field>
      <Field label="Descripción" htmlFor="description" error={e.description} hint="Admite formato simple: ## títulos, - listas, **negrita**.">
        <Textarea id="description" name="description" defaultValue={c.description} rows={8} />
      </Field>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Categoría" htmlFor="categoryId" error={e.categoryId}>
          <Select id="categoryId" name="categoryId" defaultValue={c.categoryId ?? ""} required>
            <option value="">Seleccione…</option>
            {categories.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nivel" htmlFor="level" error={e.level}>
          <Select id="level" name="level" defaultValue={c.level ?? "INICIAL"}>
            {Object.entries(LEVELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Duración estimada (min)" htmlFor="estimatedMinutes" error={e.estimatedMinutes} hint="Define las horas del certificado.">
          <Input id="estimatedMinutes" name="estimatedMinutes" type="number" min={1} defaultValue={c.estimatedMinutes ?? 60} />
        </Field>
        <Field label="Instructor" htmlFor="instructorId">
          <Select id="instructorId" name="instructorId" defaultValue={c.instructorId ?? ""}>
            <option value="">Sin instructor</option>
            {instructors.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <fieldset>
          <legend className="mb-1 text-sm font-medium">Marcas patrocinadoras</legend>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-ink-200 bg-white p-3">
            {brands.length === 0 && <p className="text-sm text-ink-500">No hay marcas cargadas.</p>}
            {brands.map((b) => (
              <Checkbox key={b.id} name="sponsorIds" value={b.id} label={b.name} defaultChecked={c.sponsorIds?.includes(b.id)} />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1 text-sm font-medium">Fichas técnicas recomendadas</legend>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-ink-200 bg-white p-3">
            {sheets.length === 0 && <p className="text-sm text-ink-500">No hay fichas cargadas.</p>}
            {sheets.map((s) => (
              <Checkbox key={s.id} name="sheetIds" value={s.id} label={`${s.name} (${s.brand})`} defaultChecked={c.sheetIds?.includes(s.id)} />
            ))}
          </div>
        </fieldset>
      </div>
      <div className="grid gap-4 md:grid-cols-3 md:items-end">
        <Field label="Imagen de portada" htmlFor="cover" error={e.cover} hint="PNG, JPG, WEBP o SVG, máx. 5 MB, formato 16:9.">
          <Input id="cover" name="cover" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="py-1.5" />
        </Field>
        <Field label="Estado" htmlFor="status">
          <Select id="status" name="status" defaultValue={c.status ?? "DRAFT"}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Checkbox name="featured" label="Destacar en la página de inicio" defaultChecked={c.featured} className="h-10" />
      </div>
      <SubmitButton pendingText="Guardando…">{c.id ? "Guardar cambios" : "Crear curso"}</SubmitButton>
    </form>
  );
}

export function ModuleForm({ courseId, module }: { courseId: string; module?: { id: string; title: string } }) {
  const [state, action] = useActionState(saveModuleAction, initialState);
  const ref = useResetOnSuccess(state, !module);
  return (
    <form ref={ref} action={action} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <input type="hidden" name="courseId" value={courseId} />
      {module && <input type="hidden" name="id" value={module.id} />}
      <div className="flex-1">
        <Input name="title" defaultValue={module?.title} placeholder="Título del módulo" aria-label="Título del módulo" required />
        {state.fieldErrors?.title && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.title[0]}</p>}
      </div>
      <SubmitButton variant={module ? "outline" : "secondary"} pendingText="…">
        {module ? "Renombrar" : "Agregar módulo"}
      </SubmitButton>
    </form>
  );
}

export type LessonValues = {
  id: string;
  title: string;
  videoUrl: string;
  durationMinutes: number;
  content: string | null;
  isPreview: boolean;
};

export function LessonForm({ moduleId, lesson }: { moduleId: string; lesson?: LessonValues }) {
  const [state, action] = useActionState(saveLessonAction, initialState);
  const ref = useResetOnSuccess(state, !lesson);
  const [url, setUrl] = useState(lesson?.videoUrl ?? "");
  const parsed = url ? parseVideoUrl(url) : null;
  const e = state.fieldErrors ?? {};
  return (
    <form ref={ref} action={action} className="space-y-3">
      <FormFeedback state={state} />
      <input type="hidden" name="moduleId" value={moduleId} />
      {lesson && <input type="hidden" name="id" value={lesson.id} />}
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <Field label="Título de la lección" htmlFor={`lt-${lesson?.id ?? moduleId}`} error={e.title}>
          <Input id={`lt-${lesson?.id ?? moduleId}`} name="title" defaultValue={lesson?.title} required />
        </Field>
        <Field label="Duración (min)" htmlFor={`ld-${lesson?.id ?? moduleId}`} error={e.durationMinutes}>
          <Input id={`ld-${lesson?.id ?? moduleId}`} name="durationMinutes" type="number" min={0} defaultValue={lesson?.durationMinutes ?? 10} />
        </Field>
      </div>
      <Field
        label="URL del video (YouTube o Vimeo)"
        htmlFor={`lv-${lesson?.id ?? moduleId}`}
        error={e.videoUrl}
        hint={url ? (parsed ? `✔ ${parsed.provider === "YOUTUBE" ? "YouTube" : "Vimeo"} · id ${parsed.id}` : "URL no reconocida") : undefined}
      >
        <Input
          id={`lv-${lesson?.id ?? moduleId}`}
          name="videoUrl"
          value={url}
          onChange={(ev) => setUrl(ev.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          required
        />
      </Field>
      {parsed && (
        <div className="aspect-video max-w-sm overflow-hidden rounded-md bg-black">
          <iframe src={embedUrl(parsed)} title="Vista previa" className="h-full w-full" allowFullScreen />
        </div>
      )}
      <Field label="Contenido / apuntes" htmlFor={`lc-${lesson?.id ?? moduleId}`} hint="Formato simple: ## títulos, - listas, **negrita**.">
        <Textarea id={`lc-${lesson?.id ?? moduleId}`} name="content" defaultValue={lesson?.content ?? ""} rows={5} />
      </Field>
      <Checkbox name="isPreview" label="Lección de muestra (visible sin inscribirse)" defaultChecked={lesson?.isPreview} />
      <SubmitButton size="sm" pendingText="Guardando…">
        {lesson ? "Guardar lección" : "Agregar lección"}
      </SubmitButton>
    </form>
  );
}

export function QuizSettingsForm({
  courseId,
  modules,
  quiz,
}: {
  courseId: string;
  modules: Opt[];
  quiz?: { id: string; title: string; passingScore: number; required: boolean; moduleId: string | null };
}) {
  const [state, action] = useActionState(saveQuizAction, initialState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-3">
      <FormFeedback state={state} />
      <input type="hidden" name="courseId" value={courseId} />
      {quiz && <input type="hidden" name="id" value={quiz.id} />}
      <div className="grid gap-3 md:grid-cols-4 md:items-end">
        <Field label="Título" htmlFor={`qt-${quiz?.id ?? "new"}`} error={e.title} className="md:col-span-2">
          <Input id={`qt-${quiz?.id ?? "new"}`} name="title" defaultValue={quiz?.title ?? "Evaluación final"} required />
        </Field>
        <Field label="Puntaje mínimo (%)" htmlFor={`qp-${quiz?.id ?? "new"}`} error={e.passingScore}>
          <Input id={`qp-${quiz?.id ?? "new"}`} name="passingScore" type="number" min={1} max={100} defaultValue={quiz?.passingScore ?? 70} />
        </Field>
        <Field label="Ubicación" htmlFor={`qm-${quiz?.id ?? "new"}`}>
          <Select id={`qm-${quiz?.id ?? "new"}`} name="moduleId" defaultValue={quiz?.moduleId ?? ""}>
            <option value="">Evaluación final del curso</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                Repaso de: {m.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Checkbox name="required" label="Obligatoria para obtener el certificado" defaultChecked={quiz?.required ?? true} />
      <SubmitButton size="sm" variant={quiz ? "primary" : "secondary"} pendingText="Guardando…">
        {quiz ? "Guardar configuración" : "Crear evaluación"}
      </SubmitButton>
    </form>
  );
}

export function QuestionForm({
  quizId,
  question,
}: {
  quizId: string;
  question?: { id: string; prompt: string; explanation: string | null; options: { text: string; isCorrect: boolean }[] };
}) {
  const [state, action] = useActionState(saveQuestionAction, initialState);
  const ref = useResetOnSuccess(state, !question);
  const e = state.fieldErrors ?? {};
  const k = question?.id ?? "new";
  const correctIdx = question ? question.options.findIndex((o) => o.isCorrect) : 0;
  return (
    <form ref={ref} action={action} className="space-y-3">
      <FormFeedback state={state} />
      <input type="hidden" name="quizId" value={quizId} />
      {question && <input type="hidden" name="id" value={question.id} />}
      <Field label="Pregunta" htmlFor={`qq-${k}`} error={e.prompt}>
        <Textarea id={`qq-${k}`} name="prompt" defaultValue={question?.prompt} rows={2} required />
      </Field>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Opciones (marque la correcta)</legend>
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                value={i}
                defaultChecked={i === correctIdx}
                aria-label={`Opción ${i + 1} es la correcta`}
                className="h-4 w-4 accent-brand-600"
              />
              <Input name={`option${i}`} defaultValue={question?.options[i]?.text} placeholder={`Opción ${i + 1}${i > 1 ? " (opcional)" : ""}`} />
            </div>
          ))}
        </div>
        {(e.options || e.correct) && <p className="mt-1 text-xs text-red-600">{(e.options ?? e.correct)![0]}</p>}
      </fieldset>
      <Field label="Explicación (se muestra al corregir)" htmlFor={`qe-${k}`}>
        <Input id={`qe-${k}`} name="explanation" defaultValue={question?.explanation ?? ""} />
      </Field>
      <SubmitButton size="sm" pendingText="Guardando…">
        {question ? "Guardar pregunta" : "Agregar pregunta"}
      </SubmitButton>
    </form>
  );
}
