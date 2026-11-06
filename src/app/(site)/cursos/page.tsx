import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { listCategoriesWithCourses, listPublishedCourses } from "@/server/queries/courses";
import { listBrands } from "@/server/queries/brands";
import { catalogHref, DURATIONS, hasFilters, parseCatalogQuery } from "@/lib/domain/catalog";
import { LEVELS } from "@/lib/constants";
import { CourseRow } from "@/components/course/course-card";
import { CatalogFilters } from "@/components/course/catalog-filters";
import { SortSelect } from "@/components/course/sort-select";
import { ButtonLink } from "@/components/ui/button";
import { Container, EmptyState } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Cursos",
  description: "Catálogo de cursos sobre materiales de construcción y sistemas constructivos.",
};

export default async function CursosPage({ searchParams }: PageProps<"/cursos">) {
  const query = parseCatalogQuery(await searchParams);
  const [courses, categories, brands] = await Promise.all([listPublishedCourses(query), listCategoriesWithCourses(), listBrands()]);
  const filtered = hasFilters(query);
  const single = query.categorias.length === 1 && !query.q ? categories.find((c) => c.slug === query.categorias[0]) : undefined;
  const title = query.q ? `${courses.length} resultados para «${query.q}»` : single ? `Cursos de ${single.name.toLowerCase()}` : "Todos los cursos";

  // Chips de filtros activos (cada uno se puede quitar).
  const chips = [
    ...query.categorias.map((c) => ({ label: categories.find((x) => x.slug === c)?.name ?? c, href: catalogHref(query, { categorias: query.categorias.filter((x) => x !== c) }) })),
    ...query.niveles.map((n) => ({ label: LEVELS[n], href: catalogHref(query, { niveles: query.niveles.filter((x) => x !== n) }) })),
    ...query.duraciones.map((d) => ({ label: DURATIONS[d].label, href: catalogHref(query, { duraciones: query.duraciones.filter((x) => x !== d) }) })),
    ...query.marcas.map((m) => ({ label: brands.find((b) => b.slug === m)?.name ?? m, href: catalogHref(query, { marcas: query.marcas.filter((x) => x !== m) }) })),
  ];

  const filters = (
    <CatalogFilters
      query={query}
      categories={categories.map((c) => ({ slug: c.slug, name: c.name, count: c._count.courses }))}
      brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
    />
  );

  return (
    <Container className="py-8">
      {single && <p className="kicker mb-1 text-brand-700">Categoría</p>}
      <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h1>
      {!query.q && <p className="mt-1 text-ink-600">{courses.length} {courses.length === 1 ? "curso" : "cursos"} con evaluación y certificado.</p>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <details className="w-full lg:hidden">
          <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-md border border-ink-900 px-4 text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filtrar {chips.length > 0 && `(${chips.length})`}
          </summary>
          <div className="mt-2 rounded-md border border-ink-200 bg-white px-4 pb-4">{filters}</div>
        </details>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <Link key={c.label} href={c.href} className="inline-flex items-center gap-1 rounded-full border border-ink-900 bg-white px-3 py-1 text-sm hover:bg-ink-50">
              {c.label} <X className="h-3.5 w-3.5" aria-label="Quitar filtro" />
            </Link>
          ))}
        </div>
        <SortSelect query={query} />
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          {filters}
        </aside>
        <section aria-label="Resultados">
          {courses.length === 0 ? (
            <EmptyState
              title={query.q ? `No encontramos cursos para «${query.q}»` : "No hay cursos con esos filtros"}
              action={filtered ? <ButtonLink href="/cursos" variant="outline">Ver todos los cursos</ButtonLink> : undefined}
            >
              Revise la ortografía o pruebe con un término más general, por ejemplo “concreto” o “techos”.
            </EmptyState>
          ) : (
            <div className="border-t border-ink-200">
              {courses.map((c) => (
                <CourseRow key={c.id} course={c} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Container>
  );
}
