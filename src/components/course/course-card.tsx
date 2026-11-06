import Link from "next/link";
import { Check } from "lucide-react";
import type { CourseCardData } from "@/server/queries/courses";
import { LEVELS } from "@/lib/constants";
import { formatDuration } from "@/lib/format";
import { Cover } from "@/components/ui/cover";
import { Badge, ProgressBar } from "@/components/ui/misc";

const lessonsOf = (c: CourseCardData) => c.modules.reduce((n, m) => n + m._count.lessons, 0);

function Meta({ course }: { course: CourseCardData }) {
  return (
    <p className="text-xs text-ink-500">
      {formatDuration(course.estimatedMinutes)} en total · {lessonsOf(course)} lecciones · {LEVELS[course.level]}
    </p>
  );
}

/**
 * Tarjeta vertical (carruseles y grillas). Con `popover`, muestra una vista rápida al pasar el cursor en desktop
 * (no usar dentro de carruseles: el desplazamiento horizontal la recortaría).
 */
export function CourseCard({
  course,
  progress,
  href,
  popover = false,
}: {
  course: CourseCardData;
  progress?: number;
  href?: string;
  popover?: boolean;
}) {
  return (
    <div className="group/card relative h-full">
      <Link href={href ?? `/cursos/${course.slug}`} className="flex h-full flex-col">
        <div className="overflow-hidden rounded-sm border border-ink-200">
          <Cover fileKey={course.coverKey} alt="" className="transition group-hover/card:opacity-90" />
        </div>
        <div className="flex flex-1 flex-col pt-2">
          <h3 className="line-clamp-2 font-bold leading-snug text-ink-900">{course.title}</h3>
          {course.instructor && <p className="mt-0.5 truncate text-xs text-ink-500">{course.instructor.name}</p>}
          {progress !== undefined ? (
            <div className="mt-2">
              <ProgressBar value={progress} className="h-1.5" />
              <p className="mt-1 text-xs text-ink-600">{progress === 100 ? "Completado" : `${progress}% completado`}</p>
            </div>
          ) : (
            <>
              <p className="mt-1 text-xs text-ink-600">
                <span className="font-semibold text-ink-800">{course._count.enrollments}</span> inscritos
              </p>
              <div className="mt-0.5">
                <Meta course={course} />
              </div>
              {course.featured && (
                <div className="mt-2">
                  <Badge tone="brand">Destacado</Badge>
                </div>
              )}
            </>
          )}
        </div>
      </Link>
      {popover && progress === undefined && course.outcomes.length > 0 && (
        <div
          role="tooltip"
          className="pointer-events-none invisible absolute left-full top-0 z-30 ml-3 hidden w-80 rounded-md border border-ink-200 bg-white p-5 opacity-0 shadow-xl transition-opacity [@media(hover:hover)]:lg:block group-hover/card:pointer-events-auto group-hover/card:visible group-hover/card:opacity-100"
        >
          <p className="font-bold text-ink-900">{course.title}</p>
          <p className="mt-1 text-xs text-ink-500">
            <span className="font-semibold text-green-700">Actualizado</span> · {LEVELS[course.level]} · {formatDuration(course.estimatedMinutes)}
          </p>
          <p className="mt-2 text-sm text-ink-700">{course.summary}</p>
          <ul className="mt-3 space-y-1.5">
            {course.outcomes.slice(0, 3).map((o) => (
              <li key={o} className="flex gap-2 text-sm text-ink-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink-900" aria-hidden /> {o}
              </li>
            ))}
          </ul>
          <Link
            href={`/cursos/${course.slug}`}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-md bg-brand-500 font-semibold text-ink-900 hover:bg-brand-200"
          >
            Ver curso
          </Link>
        </div>
      )}
    </div>
  );
}

/** Tarjeta horizontal para resultados de búsqueda. */
export function CourseRow({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="group flex flex-col gap-4 border-b border-ink-200 py-5 sm:flex-row"
    >
      <div className="w-full shrink-0 self-start overflow-hidden rounded-sm border border-ink-200 sm:w-64">
        <Cover fileKey={course.coverKey} alt="" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold leading-snug text-ink-900 group-hover:underline">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-700">{course.summary}</p>
        {course.instructor && <p className="mt-1 text-xs text-ink-500">{course.instructor.name}</p>}
        <p className="mt-1 text-xs text-ink-600">
          <span className="font-semibold text-ink-800">{course._count.enrollments}</span> inscritos
        </p>
        <Meta course={course} />
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge tone="brand">{course.category.name}</Badge>
          {course.featured && <Badge tone="brand">Destacado</Badge>}
        </div>
        {course.sponsors.length > 0 && (
          <p className="mt-2 text-xs text-ink-500">Con el apoyo de {course.sponsors.map((s) => s.name).join(", ")}</p>
        )}
      </div>
    </Link>
  );
}
