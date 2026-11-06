import "server-only";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { questionAnsweredEmail } from "@/lib/email/templates";
import { DomainError } from "./enrollment";

async function requireLessonAccess(userId: string, lessonId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, title: true, module: { select: { course: { select: { id: true, slug: true, title: true } } } } },
  });
  if (!lesson) throw new DomainError("Lección no encontrada.");
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { role: true } });
  if (user.role !== "ADMIN") {
    const enrolled = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.module.course.id } },
      select: { id: true },
    });
    if (!enrolled) throw new DomainError("Debe estar inscrito en el curso para participar en las preguntas.");
  }
  return { lesson, isStaff: user.role === "ADMIN" };
}

export async function askQuestion(userId: string, lessonId: string, title: string, body: string) {
  await requireLessonAccess(userId, lessonId);
  return db.lessonQuestion.create({ data: { lessonId, userId, title, body } });
}

export async function answerQuestion(userId: string, questionId: string, body: string) {
  const question = await db.lessonQuestion.findUnique({
    where: { id: questionId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!question || question.hidden) throw new DomainError("La pregunta no existe o fue ocultada.");
  const { lesson, isStaff } = await requireLessonAccess(userId, question.lessonId);
  const answer = await db.lessonAnswer.create({ data: { questionId, userId, body, isStaff } });
  // Aviso al autor cuando responde el equipo académico.
  if (isStaff && question.userId !== userId) {
    const url = `${env.APP_URL}/cursos/${lesson.module.course.slug}/leccion/${lesson.id}?tab=preguntas`;
    try {
      await sendEmail({
        to: question.user.email,
        ...questionAnsweredEmail(question.user.name, question.title, lesson.module.course.title, body, url),
      });
    } catch (e) {
      console.error("No se pudo enviar el aviso de respuesta", e);
    }
  }
  return answer;
}

export async function setQuestionHidden(questionId: string, hidden: boolean) {
  return db.lessonQuestion.update({ where: { id: questionId }, data: { hidden } });
}

export function listLessonQuestions(lessonId: string) {
  return db.lessonQuestion.findMany({
    where: { lessonId, hidden: false },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      answers: { orderBy: { createdAt: "asc" }, include: { user: { select: { name: true } } } },
    },
  });
}

export function countUnansweredQuestions() {
  return db.lessonQuestion.count({ where: { hidden: false, answers: { none: { isStaff: true } } } });
}
