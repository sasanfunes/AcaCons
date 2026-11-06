import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import type { CourseCardData } from "@/server/queries/courses";
import { LEVELS } from "@/lib/constants";
import { formatDuration } from "@/lib/format";
import { Cover } from "@/components/ui/cover";
import { Badge, ProgressBar } from "@/components/ui/misc";

export function CourseCard({ course, progress }: { course: CourseCardData; progress?: number }) {
  const lessons = course.modules.reduce((n, m) => n + m._count.lessons, 0);
  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-ink-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <Cover fileKey={course.coverKey} alt="" />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge tone="brand">{course.category.name}</Badge>
          <Badge>{LEVELS[course.level]}</Badge>
        </div>
        <h3 className="font-semibold leading-snug text-ink-900 group-hover:text-brand-700">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-600">{course.summary}</p>
        <div className="mt-auto pt-4">
          {progress !== undefined ? (
            <div>
              <div className="mb-1 flex justify-between text-xs text-ink-600">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          ) : (
            <div className="flex items-center gap-4 text-xs text-ink-500">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" aria-hidden /> {lessons} lecciones
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden /> {formatDuration(course.estimatedMinutes)}
              </span>
            </div>
          )}
          {course.sponsors.length > 0 && (
            <p className="mt-2 text-xs text-ink-500">Con el apoyo de {course.sponsors.map((s) => s.name).join(", ")}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
