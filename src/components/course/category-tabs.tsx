"use client";
import Link from "next/link";
import { useState } from "react";
import type { CourseCardData } from "@/server/queries/courses";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { CourseCard } from "./course-card";
import { cn } from "@/lib/cn";

type Tab = { id: string; name: string; slug: string; courses: CourseCardData[] };

/** Pestañas por categoría con un carrusel de cursos por pestaña. */
export function CategoryTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  if (!current) return null;
  return (
    <div>
      <div role="tablist" aria-label="Categorías" className="mb-5 flex gap-1 overflow-x-auto border-b border-ink-200 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={t.id === current.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold",
              t.id === current.id ? "border-ink-900 text-ink-900" : "border-transparent text-ink-500 hover:text-ink-900",
            )}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="rounded-md border border-ink-200 bg-white p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl text-ink-700">
            Cursos de <strong>{current.name.toLowerCase()}</strong>: especificación, instalación y control de calidad en obra.
          </p>
          <Link href={`/cursos?categoria=${current.slug}`} className="shrink-0 rounded-md border border-ink-900 px-4 py-2 text-sm font-semibold hover:bg-ink-50">
            Ver {current.name.toLowerCase()}
          </Link>
        </div>
        <Carousel label={`Cursos de ${current.name}`}>
          {current.courses.map((c) => (
            <CarouselItem key={c.id}>
              <CourseCard course={c} />
            </CarouselItem>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
