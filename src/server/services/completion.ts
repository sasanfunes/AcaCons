import "server-only";
import { db } from "@/lib/db";
import { generateCode } from "@/lib/domain/codes";
import { isCourseComplete } from "@/lib/domain/progress";
import { gradeQuiz, type QuizAnswers } from "@/lib/domain/quiz";
import { DomainError } from "./enrollment";

async function requireEnrollment(userId: string, courseId: string) {
  const enrollment = await db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (!enrollment) throw new DomainError("Debe inscribirse en el curso.");
  return enrollment;
}

export async function markLessonComplete(userId: string, lessonId: string) {
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { module: { select: { courseId: true } } } });
  if (!lesson) throw new DomainError("Lección no encontrada.");
  const courseId = lesson.module.courseId;
  await requireEnrollment(userId, courseId);
  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId },
    update: {},
  });
  return evaluateCompletion(userId, courseId);
}

export async function unmarkLessonComplete(userId: string, lessonId: string) {
  await db.lessonProgress.deleteMany({ where: { userId, lessonId } });
}

export async function submitQuizAttempt(userId: string, quizId: string, answers: QuizAnswers) {
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { options: { select: { id: true, isCorrect: true } } } } },
  });
  if (!quiz) throw new DomainError("Evaluación no encontrada.");
  await requireEnrollment(userId, quiz.courseId);
  const result = gradeQuiz(quiz.questions, answers, quiz.passingScore);
  const attempt = await db.quizAttempt.create({
    data: { userId, quizId, score: result.score, passed: result.passed, answers: answers as Record<string, string> },
  });
  const completion = await evaluateCompletion(userId, quiz.courseId);
  return { attempt, result, completion };
}

/** Si el curso quedó completo, marca la inscripción y emite el certificado (idempotente). */
export async function evaluateCompletion(userId: string, courseId: string) {
  const [course, completed, passed, user] = await Promise.all([
    db.course.findUniqueOrThrow({
      where: { id: courseId },
      select: {
        title: true,
        estimatedMinutes: true,
        modules: { select: { lessons: { select: { id: true } } } },
        quizzes: { where: { required: true }, select: { id: true } },
      },
    }),
    db.lessonProgress.findMany({ where: { userId, lesson: { module: { courseId } } }, select: { lessonId: true } }),
    db.quizAttempt.findMany({ where: { userId, passed: true, quiz: { courseId } }, select: { quizId: true }, distinct: ["quizId"] }),
    db.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } }),
  ]);
  const complete = isCourseComplete({
    lessonIds: course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
    completedIds: completed.map((c) => c.lessonId),
    requiredQuizIds: course.quizzes.map((q) => q.id),
    passedQuizIds: passed.map((p) => p.quizId),
  });
  if (!complete) return { complete: false as const, certificate: null };

  const existing = await db.certificate.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (existing) return { complete: true as const, certificate: existing, isNew: false };

  const now = new Date();
  await db.enrollment.updateMany({ where: { userId, courseId, completedAt: null }, data: { completedAt: now } });
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const certificate = await db.certificate.create({
        data: {
          code: generateCode("CERT"),
          userId,
          courseId,
          issuedAt: now,
          holderName: user.name,
          courseTitle: course.title,
          hours: Math.max(1, Math.round(course.estimatedMinutes / 60)),
        },
      });
      return { complete: true as const, certificate, isNew: true };
    } catch (e) {
      // P2002: unique violation. Si fue por userId+courseId (carrera), devolvemos el existente; si fue por código, reintentamos.
      if ((e as { code?: string }).code !== "P2002") throw e;
      const raced = await db.certificate.findUnique({ where: { userId_courseId: { userId, courseId } } });
      if (raced) return { complete: true as const, certificate: raced, isNew: false };
    }
  }
  throw new Error("No se pudo generar un código de certificado único");
}
