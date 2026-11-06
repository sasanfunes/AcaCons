/* eslint-disable @next/next/no-img-element -- logo SVG estático */
import Link from "next/link";
import { notFound } from "next/navigation";
import { X } from "lucide-react";
import { getCourseBySlug, getUserCourseState, lessonOrder } from "@/server/queries/courses";
import { getOptionalUser } from "@/server/guards";
import { courseProgress } from "@/lib/domain/progress";

/** Layout del reproductor: barra superior propia, sin el encabezado ni el pie del sitio. */
export default async function PlayerLayout({ children, params }: LayoutProps<"/cursos/[slug]">) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  const user = await getOptionalUser();
  const state = await getUserCourseState(user?.id, course.id);
  const progress = state ? courseProgress(lessonOrder(course).map((l) => l.id), state.completedIds) : 0;
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b-4 border-brand-500 bg-ink-900 px-4 text-white">
        <Link href="/" className="hidden shrink-0 sm:block" aria-label="La Academia del Constructor, inicio">
          <img src="/brand/logo-negativo.svg" alt="La Academia del Constructor" className="h-8 w-auto" />
        </Link>
        <span className="hidden h-6 w-px bg-white/30 sm:block" aria-hidden />
        <Link href={`/cursos/${course.slug}`} className="min-w-0 flex-1 truncate text-sm font-semibold hover:underline">
          {course.title}
        </Link>
        {state && (
          <div className="flex shrink-0 items-center gap-2 text-sm" title={`${progress}% completado`}>
            <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90" aria-hidden>
              <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="3" />
              <circle cx="18" cy="18" r={r} fill="none" stroke="#F26A1B" strokeWidth="3" strokeDasharray={c} strokeDashoffset={c * (1 - progress / 100)} strokeLinecap="round" />
            </svg>
            <span className="hidden md:inline">Su progreso: {progress}%</span>
          </div>
        )}
        <Link href={`/cursos/${course.slug}`} className="flex shrink-0 items-center gap-1 rounded-md border border-white/40 px-3 py-1.5 text-sm hover:bg-white/10">
          <X className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Salir al curso</span>
        </Link>
      </header>
      <main id="contenido" className="flex-1">
        {children}
      </main>
    </div>
  );
}
