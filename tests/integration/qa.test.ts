import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { sentEmails } from "@/lib/email";
import { enroll } from "@/server/services/enrollment";
import { answerQuestion, askQuestion, countUnansweredQuestions, listLessonQuestions, setQuestionHidden } from "@/server/services/qa";
import { createCourse, createUser, resetDb } from "./helpers";

describe("preguntas y respuestas", () => {
  beforeEach(resetDb);

  it("solo alumnos inscritos pueden preguntar", async () => {
    const user = await createUser();
    const { lessons } = await createCourse();
    await expect(askQuestion(user.id, lessons[0]!.id, "Duda", "Detalle de la duda")).rejects.toThrow(/inscrito/);
  });

  it("la respuesta del admin se marca como del equipo y avisa por correo", async () => {
    const student = await createUser("Alumno");
    const admin = await createUser("Admin");
    await db.user.update({ where: { id: admin.id }, data: { role: "ADMIN" } });
    const { course, lessons } = await createCourse();
    await enroll(student.id, course.id);

    const q = await askQuestion(student.id, lessons[0]!.id, "¿Qué traslape usar?", "En losas con poca pendiente.");
    expect(await countUnansweredQuestions()).toBe(1);

    // Otro alumno responde: no cuenta como respuesta del equipo.
    const peer = await createUser("Compañero");
    await enroll(peer.id, course.id);
    const peerAnswer = await answerQuestion(peer.id, q.id, "Yo uso 10 cm.");
    expect(peerAnswer.isStaff).toBe(false);
    expect(await countUnansweredQuestions()).toBe(1);

    const before = sentEmails.length;
    const a = await answerQuestion(admin.id, q.id, "Mínimo 10 cm en el sentido del escurrimiento.");
    expect(a.isStaff).toBe(true);
    expect(await countUnansweredQuestions()).toBe(0);
    expect(sentEmails.length).toBe(before + 1);
    expect(sentEmails.at(-1)?.to).toBe(student.email);

    const list = await listLessonQuestions(lessons[0]!.id);
    expect(list[0]?.answers.map((x) => x.isStaff)).toEqual([false, true]);
  });

  it("las preguntas ocultas no se listan ni se pueden responder", async () => {
    const student = await createUser();
    const { course, lessons } = await createCourse();
    await enroll(student.id, course.id);
    const q = await askQuestion(student.id, lessons[0]!.id, "Pregunta", "Texto de la pregunta");
    await setQuestionHidden(q.id, true);
    expect(await listLessonQuestions(lessons[0]!.id)).toHaveLength(0);
    await expect(answerQuestion(student.id, q.id, "respuesta")).rejects.toThrow(/ocultada/);
  });
});
