export type GradableQuestion = { id: string; options: { id: string; isCorrect: boolean }[] };
export type QuizAnswers = Record<string, string | undefined>;

export type QuizResult = {
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
  perQuestion: { questionId: string; selectedOptionId: string | null; correctOptionId: string | null; correct: boolean }[];
};

/** Califica un intento: una opción correcta por pregunta; las no respondidas cuentan como incorrectas. */
export function gradeQuiz(questions: readonly GradableQuestion[], answers: QuizAnswers, passingScore: number): QuizResult {
  const perQuestion = questions.map((q) => {
    const selected = answers[q.id] ?? null;
    const correctOption = q.options.find((o) => o.isCorrect) ?? null;
    const selectedValid = selected !== null && q.options.some((o) => o.id === selected);
    return {
      questionId: q.id,
      selectedOptionId: selectedValid ? selected : null,
      correctOptionId: correctOption?.id ?? null,
      correct: selectedValid && correctOption !== null && correctOption.id === selected,
    };
  });
  const total = questions.length;
  const correctCount = perQuestion.filter((p) => p.correct).length;
  const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  return { score, passed: total > 0 && score >= passingScore, correctCount, total, perQuestion };
}
