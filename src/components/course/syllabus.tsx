import Link from "next/link";
import { CheckCircle2, Circle, ClipboardCheck, Lock, PlayCircle } from "lucide-react";
import type { CourseDetail, UserCourseState } from "@/server/queries/courses";
import { cn } from "@/lib/cn";

export function Syllabus({
  course,
  state,
  currentLessonId,
  currentQuizId,
  compact,
}: {
  course: CourseDetail;
  state: UserCourseState | null;
  currentLessonId?: string;
  currentQuizId?: string;
  compact?: boolean;
}) {
  const enrolled = !!state;
  const finalQuizzes = course.quizzes;
  return (
    <ol className="space-y-4">
      {course.modules.map((m, mi) => (
        <li key={m.id}>
          <p className={cn("mb-1 font-semibold text-ink-800", compact ? "text-sm" : "")}>
            Módulo {mi + 1}: {m.title}
          </p>
          <ul className="divide-y divide-ink-100 rounded-md border border-ink-200 bg-white">
            {m.lessons.map((l) => {
              const done = state?.completedIds.has(l.id);
              const accessible = enrolled || l.isPreview;
              const current = l.id === currentLessonId;
              const Icon = done ? CheckCircle2 : accessible ? (current ? PlayCircle : Circle) : Lock;
              const body = (
                <>
                  <Icon className={cn("h-4 w-4 shrink-0", done ? "text-green-600" : current ? "text-brand-600" : "text-ink-400")} aria-hidden />
                  <span className="flex-1">{l.title}</span>
                  {l.isPreview && !enrolled && <span className="text-xs font-medium text-brand-700">Vista previa</span>}
                  {l.durationMinutes > 0 && <span className="text-xs text-ink-500">{l.durationMinutes} min</span>}
                </>
              );
              const cls = cn("flex items-center gap-2 px-3 py-2 text-sm", current && "bg-brand-50 font-medium");
              return (
                <li key={l.id}>
                  {accessible ? (
                    <Link href={`/cursos/${course.slug}/leccion/${l.id}`} className={cn(cls, "hover:bg-ink-50")} aria-current={current ? "page" : undefined}>
                      {body}
                      {done && <span className="sr-only">(completada)</span>}
                    </Link>
                  ) : (
                    <div className={cn(cls, "text-ink-500")}>{body}</div>
                  )}
                </li>
              );
            })}
            {m.quizzes.map((q) => (
              <QuizRow key={q.id} slug={course.slug} quiz={q} state={state} current={q.id === currentQuizId} />
            ))}
          </ul>
        </li>
      ))}
      {finalQuizzes.length > 0 && (
        <li>
          <p className={cn("mb-1 font-semibold text-ink-800", compact ? "text-sm" : "")}>Evaluación final</p>
          <ul className="divide-y divide-ink-100 rounded-md border border-ink-200 bg-white">
            {finalQuizzes.map((q) => (
              <QuizRow key={q.id} slug={course.slug} quiz={q} state={state} current={q.id === currentQuizId} />
            ))}
          </ul>
        </li>
      )}
    </ol>
  );
}

function QuizRow({
  slug,
  quiz,
  state,
  current,
}: {
  slug: string;
  quiz: { id: string; title: string; required: boolean };
  state: UserCourseState | null;
  current: boolean;
}) {
  const best = state?.bestByQuiz.get(quiz.id);
  const body = (
    <>
      {best?.passed ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
      ) : state ? (
        <ClipboardCheck className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
      ) : (
        <Lock className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
      )}
      <span className="flex-1">{quiz.title}</span>
      {best ? (
        <span className={cn("text-xs", best.passed ? "text-green-700" : "text-ink-500")}>{best.score}%</span>
      ) : (
        !quiz.required && <span className="text-xs text-ink-500">Opcional</span>
      )}
    </>
  );
  const cls = cn("flex items-center gap-2 px-3 py-2 text-sm", current && "bg-brand-50 font-medium");
  return (
    <li>
      {state ? (
        <Link href={`/cursos/${slug}/evaluacion/${quiz.id}`} className={cn(cls, "hover:bg-ink-50")}>
          {body}
        </Link>
      ) : (
        <div className={cn(cls, "text-ink-500")}>{body}</div>
      )}
    </li>
  );
}
