import Link from "next/link";
import { ChevronDown, ClipboardCheck, Lock, PlayCircle } from "lucide-react";
import type { CourseDetail, UserCourseState } from "@/server/queries/courses";
import { formatDuration } from "@/lib/format";
import { ToggleAllSections } from "./expandable";

/** Acordeón "Contenido del curso" de la página pública. */
export function Curriculum({ course, state }: { course: CourseDetail; state: UserCourseState | null }) {
  const lessons = course.modules.flatMap((m) => m.lessons);
  const minutes = lessons.reduce((n, l) => n + l.durationMinutes, 0);
  return (
    <section>
      <h2 className="mb-2 text-2xl font-bold">Contenido del curso</h2>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-700">
        <span>
          {course.modules.length} {course.modules.length === 1 ? "sección" : "secciones"} · {lessons.length}{" "}
          {lessons.length === 1 ? "lección" : "lecciones"} · {formatDuration(minutes)} de duración total
        </span>
        <ToggleAllSections targetId="temario" />
      </div>
      <div id="temario" className="overflow-hidden rounded-md border border-ink-200">
        {course.modules.map((m, i) => {
          const mm = m.lessons.reduce((n, l) => n + l.durationMinutes, 0);
          return (
            <details key={m.id} open={i === 0} className="group border-b border-ink-200 last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center gap-3 bg-ink-50 px-4 py-3">
                <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" aria-hidden />
                <span className="flex-1 font-semibold text-ink-900">{m.title}</span>
                <span className="hidden text-sm text-ink-600 sm:inline">
                  {m.lessons.length} lecciones · {formatDuration(mm)}
                </span>
              </summary>
              <ul className="space-y-1 bg-white px-4 py-3">
                {m.lessons.map((l) => {
                  const can = !!state || l.isPreview;
                  return (
                    <li key={l.id} className="flex items-center gap-3 py-1.5 text-sm">
                      {can ? <PlayCircle className="h-4 w-4 shrink-0 text-ink-600" aria-hidden /> : <Lock className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />}
                      {can ? (
                        <Link href={`/cursos/${course.slug}/leccion/${l.id}`} className="flex-1 text-ink-800 underline-offset-2 hover:underline">
                          {l.title}
                        </Link>
                      ) : (
                        <span className="flex-1 text-ink-800">{l.title}</span>
                      )}
                      {l.isPreview && !state && (
                        <Link href={`/cursos/${course.slug}/leccion/${l.id}`} className="font-semibold text-brand-700 underline">
                          Vista previa
                        </Link>
                      )}
                      <span className="w-14 text-right text-ink-500">{l.durationMinutes ? `${l.durationMinutes} min` : ""}</span>
                    </li>
                  );
                })}
                {m.quizzes.map((q) => (
                  <li key={q.id} className="flex items-center gap-3 py-1.5 text-sm text-ink-800">
                    <ClipboardCheck className="h-4 w-4 shrink-0 text-ink-600" aria-hidden /> {q.title}
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
        {course.quizzes.length > 0 && (
          <div className="flex items-center gap-3 bg-ink-50 px-4 py-3 text-sm">
            <ClipboardCheck className="h-4 w-4 text-brand-700" aria-hidden />
            <span className="flex-1 font-semibold">Evaluación final</span>
            <span className="text-ink-600">{course.quizzes.map((q) => `${q._count.questions} preguntas`).join(" · ")}</span>
          </div>
        )}
      </div>
    </section>
  );
}
