import { describe, expect, it } from "vitest";
import { courseProgress, isCourseComplete, nextPendingLesson } from "@/lib/domain/progress";

describe("courseProgress", () => {
  it("0 sin lecciones", () => expect(courseProgress([], [])).toBe(0));
  it("redondea hacia abajo", () => expect(courseProgress(["a", "b", "c"], ["a"])).toBe(33));
  it("ignora ids ajenos al curso", () => expect(courseProgress(["a", "b"], ["a", "x"])).toBe(50));
  it("100 con todo visto", () => expect(courseProgress(["a", "b"], ["b", "a"])).toBe(100));
});

describe("isCourseComplete", () => {
  const base = { lessonIds: ["a", "b"], completedIds: ["a", "b"], requiredQuizIds: ["q1"], passedQuizIds: ["q1"] };
  it("completo con lecciones y quiz aprobado", () => expect(isCourseComplete(base)).toBe(true));
  it("falta una lección", () => expect(isCourseComplete({ ...base, completedIds: ["a"] })).toBe(false));
  it("falta aprobar el quiz", () => expect(isCourseComplete({ ...base, passedQuizIds: [] })).toBe(false));
  it("sin quizzes obligatorios", () => expect(isCourseComplete({ ...base, requiredQuizIds: [], passedQuizIds: [] })).toBe(true));
  it("un curso sin lecciones nunca está completo", () =>
    expect(isCourseComplete({ lessonIds: [], completedIds: [], requiredQuizIds: [], passedQuizIds: [] })).toBe(false));
});

describe("nextPendingLesson", () => {
  it("primera pendiente", () => expect(nextPendingLesson(["a", "b", "c"], ["a"])).toBe("b"));
  it("todas vistas → la primera", () => expect(nextPendingLesson(["a", "b"], ["a", "b"])).toBe("a"));
  it("sin lecciones", () => expect(nextPendingLesson([], [])).toBeNull());
});
