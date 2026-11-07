"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/guards";
import { db } from "@/lib/db";
import { DomainError, enroll } from "@/server/services/enrollment";
import { markLessonComplete, submitQuizAttempt, unmarkLessonComplete } from "@/server/services/completion";
import type { ActionState } from "@/lib/validation/action";

export async function enrollAction(formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "");
  const course = await db.course.findUnique({ where: { id: courseId }, select: { slug: true } });
  if (!course) redirect("/cursos");
  const user = await requireUser(`/cursos/${course.slug}`);
  await enroll(user.id, courseId);
  const first = await db.lesson.findFirst({
    where: { module: { courseId } },
    orderBy: [{ module: { position: "asc" } }, { position: "asc" }],
    select: { id: true },
  });
  revalidatePath(`/cursos/${course.slug}`);
  redirect(first ? `/cursos/${course.slug}/leccion/${first.id}` : `/cursos/${course.slug}`);
}

export async function toggleLessonAction(formData: FormData) {
  const lessonId = String(formData.get("lessonId") ?? "");
  const done = formData.get("done") === "1";
  const next = String(formData.get("next") ?? "");
  const user = await requireUser();
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { course: { select: { slug: true } } } } },
  });
  if (!lesson) redirect("/mi-cuenta");
  const slug = lesson.module.course.slug;
  let completed = false;
  if (done) {
    try {
      const r = await markLessonComplete(user.id, lessonId);
      completed = r.complete && "isNew" in r && r.isNew === true;
    } catch (e) {
      if (e instanceof DomainError) redirect(`/cursos/${slug}`);
      throw e;
    }
  } else {
    await unmarkLessonComplete(user.id, lessonId);
  }
  revalidatePath(`/cursos/${slug}`, "layout");
  if (completed) redirect(`/cursos/${slug}?completado=1`);
  if (done && next.startsWith(`/cursos/${slug}/`)) redirect(next);
}

export type AutoCompleteResult = { ok: boolean; courseCompleted?: boolean; certificateCode?: string };

/** Marca la lección como completada cuando el video llega casi al final (sin redirigir). */
export async function autoCompleteLessonAction(lessonId: string): Promise<AutoCompleteResult> {
  const user = await requireUser();
  const lesson = await db.lesson.findUnique({
    where: { id: String(lessonId) },
    select: { module: { select: { course: { select: { slug: true } } } } },
  });
  if (!lesson) return { ok: false };
  try {
    const r = await markLessonComplete(user.id, String(lessonId));
    revalidatePath(`/cursos/${lesson.module.course.slug}`, "layout");
    return { ok: true, courseCompleted: r.complete, certificateCode: r.certificate?.code };
  } catch (e) {
    if (e instanceof DomainError) return { ok: false };
    throw e;
  }
}

export type QuizActionState = ActionState & {
  result?: { score: number; passed: boolean; correctCount: number; total: number; perQuestion: { questionId: string; selectedOptionId: string | null; correctOptionId: string | null; correct: boolean }[] };
  certificateCode?: string;
  explanations?: Record<string, string>;
};

export async function submitQuizAction(_prev: QuizActionState, formData: FormData): Promise<QuizActionState> {
  const quizId = String(formData.get("quizId") ?? "");
  const user = await requireUser();
  const answers: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("q_") && typeof v === "string") answers[k.slice(2)] = v;
  }
  try {
    const { result, completion } = await submitQuizAttempt(user.id, quizId, answers);
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: { course: { select: { slug: true } }, questions: { select: { id: true, explanation: true } } },
    });
    if (quiz) revalidatePath(`/cursos/${quiz.course.slug}`, "layout");
    const explanations = Object.fromEntries(
      (quiz?.questions ?? []).filter((q) => q.explanation).map((q) => [q.id, q.explanation as string]),
    );
    return { ok: true, result, certificateCode: completion.certificate?.code, explanations };
  } catch (e) {
    if (e instanceof DomainError) return { error: e.message };
    throw e;
  }
}
