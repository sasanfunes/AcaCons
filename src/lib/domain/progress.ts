/** Porcentaje (0–100, entero) de lecciones completadas. */
export function courseProgress(lessonIds: readonly string[], completedIds: Iterable<string>): number {
  if (lessonIds.length === 0) return 0;
  const done = new Set(completedIds);
  const count = lessonIds.filter((id) => done.has(id)).length;
  return Math.floor((count / lessonIds.length) * 100);
}

export type CompletionInput = {
  lessonIds: readonly string[];
  completedIds: Iterable<string>;
  requiredQuizIds: readonly string[];
  passedQuizIds: Iterable<string>;
};

/** Un curso está completo si tiene al menos una lección, todas están vistas y todas las evaluaciones obligatorias están aprobadas. */
export function isCourseComplete(input: CompletionInput): boolean {
  if (input.lessonIds.length === 0) return false;
  const done = new Set(input.completedIds);
  const passed = new Set(input.passedQuizIds);
  return input.lessonIds.every((id) => done.has(id)) && input.requiredQuizIds.every((id) => passed.has(id));
}

/** Próxima lección pendiente según el orden del temario (o la primera si todas están vistas). */
export function nextPendingLesson(lessonIds: readonly string[], completedIds: Iterable<string>): string | null {
  const done = new Set(completedIds);
  return lessonIds.find((id) => !done.has(id)) ?? lessonIds[0] ?? null;
}
