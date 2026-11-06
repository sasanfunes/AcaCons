import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { enroll } from "@/server/services/enrollment";
import { markLessonComplete, submitQuizAttempt } from "@/server/services/completion";
import { createCourse, createUser, resetDb } from "./helpers";

describe("progreso y certificados", () => {
  beforeEach(resetDb);

  it("exige inscripción para marcar lecciones", async () => {
    const user = await createUser();
    const { lessons } = await createCourse();
    await expect(markLessonComplete(user.id, lessons[0]!.id)).rejects.toThrow(/inscribirse/);
  });

  it("emite el certificado al completar lecciones y aprobar la evaluación", async () => {
    const user = await createUser("Ana");
    const { course, lessons, quiz } = await createCourse();
    await enroll(user.id, course.id);

    expect((await markLessonComplete(user.id, lessons[0]!.id)).complete).toBe(false);
    expect((await markLessonComplete(user.id, lessons[1]!.id)).complete).toBe(false);

    const [q1, q2] = quiz!.questions;
    const wrong = await submitQuizAttempt(user.id, quiz!.id, { [q1!.id]: q1!.options.find((o) => !o.isCorrect)!.id });
    expect(wrong.result.passed).toBe(false);
    expect(wrong.completion.complete).toBe(false);

    const answers = {
      [q1!.id]: q1!.options.find((o) => o.isCorrect)!.id,
      [q2!.id]: q2!.options.find((o) => o.isCorrect)!.id,
    };
    const ok = await submitQuizAttempt(user.id, quiz!.id, answers);
    expect(ok.result.score).toBe(100);
    expect(ok.completion.complete).toBe(true);
    expect(ok.completion.certificate?.code).toMatch(/^CERT-/);
    expect(ok.completion.certificate?.hours).toBe(3);

    // Idempotente: otro intento aprobado no genera un segundo certificado.
    await submitQuizAttempt(user.id, quiz!.id, answers);
    expect(await db.certificate.count({ where: { userId: user.id } })).toBe(1);
    const enrollment = await db.enrollment.findFirstOrThrow({ where: { userId: user.id } });
    expect(enrollment.completedAt).not.toBeNull();
  });

  it("curso sin evaluación se completa solo con las lecciones", async () => {
    const user = await createUser();
    const { course, lessons } = await createCourse({ lessons: 1, quiz: false });
    await enroll(user.id, course.id);
    const r = await markLessonComplete(user.id, lessons[0]!.id);
    expect(r.complete).toBe(true);
  });

  it("no permite inscribirse a un curso en borrador", async () => {
    const user = await createUser();
    const { course } = await createCourse();
    await db.course.update({ where: { id: course.id }, data: { status: "DRAFT" } });
    await expect(enroll(user.id, course.id)).rejects.toThrow(/no está disponible/);
  });
});
