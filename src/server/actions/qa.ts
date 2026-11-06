"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, requireUser } from "@/server/guards";
import { DomainError } from "@/server/services/enrollment";
import { answerQuestion, askQuestion, setQuestionHidden } from "@/server/services/qa";
import { type ActionState, validationError } from "@/lib/validation/action";

const askSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().trim().min(5, "Escriba un título de al menos 5 caracteres").max(160),
  body: z.string().trim().min(10, "Describa su pregunta (mínimo 10 caracteres)").max(4000),
});
const answerSchema = z.object({
  questionId: z.string().min(1),
  body: z.string().trim().min(2, "Escriba una respuesta").max(4000),
});

export async function askQuestionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = askSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error, formData);
  try {
    await askQuestion(user.id, parsed.data.lessonId, parsed.data.title, parsed.data.body);
  } catch (e) {
    if (e instanceof DomainError) return { error: e.message };
    throw e;
  }
  revalidatePath("/cursos", "layout");
  revalidatePath("/admin/preguntas");
  return { ok: true, message: "Su pregunta fue publicada. Le avisaremos por correo cuando el equipo académico responda." };
}

export async function answerQuestionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = answerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error, formData);
  try {
    await answerQuestion(user.id, parsed.data.questionId, parsed.data.body);
  } catch (e) {
    if (e instanceof DomainError) return { error: e.message };
    throw e;
  }
  revalidatePath("/cursos", "layout");
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Respuesta publicada." };
}

export async function setQuestionHiddenAction(formData: FormData) {
  await requireAdmin();
  await setQuestionHidden(String(formData.get("id")), formData.get("hidden") === "1");
  revalidatePath("/admin", "layout");
  revalidatePath("/cursos", "layout");
}
