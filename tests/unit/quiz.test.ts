import { describe, expect, it } from "vitest";
import { gradeQuiz } from "@/lib/domain/quiz";

const questions = [
  { id: "q1", options: [{ id: "a", isCorrect: true }, { id: "b", isCorrect: false }] },
  { id: "q2", options: [{ id: "c", isCorrect: false }, { id: "d", isCorrect: true }] },
  { id: "q3", options: [{ id: "e", isCorrect: true }, { id: "f", isCorrect: false }] },
  { id: "q4", options: [{ id: "g", isCorrect: true }, { id: "h", isCorrect: false }] },
];

describe("gradeQuiz", () => {
  it("todo correcto", () => {
    const r = gradeQuiz(questions, { q1: "a", q2: "d", q3: "e", q4: "g" }, 70);
    expect(r).toMatchObject({ score: 100, passed: true, correctCount: 4, total: 4 });
  });
  it("75% aprueba con 70", () => {
    const r = gradeQuiz(questions, { q1: "a", q2: "d", q3: "e", q4: "h" }, 70);
    expect(r.score).toBe(75);
    expect(r.passed).toBe(true);
  });
  it("50% no aprueba", () => {
    expect(gradeQuiz(questions, { q1: "a", q2: "d" }, 70)).toMatchObject({ score: 50, passed: false });
  });
  it("respuestas de otra pregunta no cuentan", () => {
    const r = gradeQuiz(questions, { q1: "d" }, 70);
    expect(r.perQuestion[0]).toMatchObject({ selectedOptionId: null, correct: false, correctOptionId: "a" });
  });
  it("quiz vacío nunca aprueba", () => {
    expect(gradeQuiz([], {}, 0)).toMatchObject({ score: 0, passed: false });
  });
  it("aprueba justo en el umbral", () => {
    expect(gradeQuiz(questions.slice(0, 2), { q1: "a" }, 50).passed).toBe(true);
  });
});
