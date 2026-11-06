import Link from "next/link";
import { Check, ChevronDown, ClipboardCheck, Lock, PlayCircle } from "lucide-react";
import type { CourseDetail, UserCourseState } from "@/server/queries/courses";
import { toggleLessonAction } from "@/server/actions/learning";
import { cn } from "@/lib/cn";

/** Temario del reproductor: acordeón por sección con casilla para marcar cada lección. */
export function PlayerCurriculum({
  course,
  state,
  currentLessonId,
  currentQuizId,
}: {
  course: CourseDetail;
  state: UserCourseState | null;
  currentLessonId?: string;
  currentQuizId?: string;
}) {
  return (
    <div>
      {course.modules.map((m, mi) => {
        const done = m.lessons.filter((l) => state?.completedIds.has(l.id)).length;
        const mins = m.lessons.reduce((n, l) => n + l.durationMinutes, 0);
        const containsCurrent = m.lessons.some((l) => l.id === currentLessonId) || m.quizzes.some((q) => q.id === currentQuizId);
        return (
          <details key={m.id} open={containsCurrent || mi === 0} className="group border-b border-ink-200">
            <summary className="flex cursor-pointer list-none items-start gap-2 bg-ink-50 px-4 py-3">
              <span className="flex-1">
                <span className="block text-sm font-bold text-ink-900">
                  Sección {mi + 1}: {m.title}
                </span>
                <span className="text-xs text-ink-500">
                  {done}/{m.lessons.length} | {mins} min
                </span>
              </span>
              <ChevronDown className="mt-1 h-4 w-4 shrink-0 transition group-open:rotate-180" aria-hidden />
            </summary>
            <ul>
              {m.lessons.map((l, li) => {
                const isDone = state?.completedIds.has(l.id) ?? false;
                const current = l.id === currentLessonId;
                const accessible = !!state || l.isPreview;
                return (
                  <li key={l.id} className={cn("flex gap-3 px-4 py-2.5", current ? "bg-brand-50" : "hover:bg-ink-50")}>
                    {state ? (
                      <form action={toggleLessonAction} className="pt-0.5">
                        <input type="hidden" name="lessonId" value={l.id} />
                        <input type="hidden" name="done" value={isDone ? "0" : "1"} />
                        <button
                          type="submit"
                          role="checkbox"
                          aria-checked={isDone}
                          aria-label={`${isDone ? "Desmarcar" : "Marcar"} “${l.title}” como completada`}
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border",
                            isDone ? "border-ink-900 bg-ink-900 text-white" : "border-ink-500 bg-white",
                          )}
                        >
                          {isDone && <Check className="h-3 w-3" strokeWidth={3} />}
                        </button>
                      </form>
                    ) : (
                      <Lock className={cn("mt-0.5 h-4 w-4 shrink-0", accessible ? "text-transparent" : "text-ink-400")} aria-hidden />
                    )}
                    {accessible ? (
                      <Link href={`/cursos/${course.slug}/leccion/${l.id}`} className="min-w-0 flex-1" aria-current={current ? "page" : undefined}>
                        <span className={cn("block text-sm", current ? "font-semibold text-ink-900" : "text-ink-800")}>
                          {li + 1}. {l.title}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                          <PlayCircle className="h-3.5 w-3.5" aria-hidden /> {l.durationMinutes} min
                        </span>
                      </Link>
                    ) : (
                      <span className="min-w-0 flex-1 text-sm text-ink-500">
                        {li + 1}. {l.title}
                      </span>
                    )}
                  </li>
                );
              })}
              {m.quizzes.map((q) => (
                <QuizItem key={q.id} slug={course.slug} quiz={q} state={state} current={q.id === currentQuizId} />
              ))}
            </ul>
          </details>
        );
      })}
      {course.quizzes.length > 0 && (
        <div className="border-b border-ink-200">
          <p className="bg-ink-50 px-4 py-3 text-sm font-bold text-ink-900">Evaluación final</p>
          <ul>
            {course.quizzes.map((q) => (
              <QuizItem key={q.id} slug={course.slug} quiz={q} state={state} current={q.id === currentQuizId} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function QuizItem({
  slug,
  quiz,
  state,
  current,
}: {
  slug: string;
  quiz: { id: string; title: string };
  state: UserCourseState | null;
  current: boolean;
}) {
  const best = state?.bestByQuiz.get(quiz.id);
  return (
    <li className={cn("flex gap-3 px-4 py-2.5", current ? "bg-brand-50" : "hover:bg-ink-50")}>
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
          best?.passed ? "border-ink-900 bg-ink-900 text-white" : "border-ink-500",
        )}
        aria-hidden
      >
        {best?.passed && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      {state ? (
        <Link href={`/cursos/${slug}/evaluacion/${quiz.id}`} className="flex-1">
          <span className={cn("block text-sm", current ? "font-semibold" : "text-ink-800")}>{quiz.title}</span>
          <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden /> Evaluación{best ? ` · mejor resultado ${best.score}%` : ""}
          </span>
        </Link>
      ) : (
        <span className="flex-1 text-sm text-ink-500">{quiz.title}</span>
      )}
    </li>
  );
}
