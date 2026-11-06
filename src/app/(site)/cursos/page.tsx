import type { Metadata } from "next";
import { Search } from "lucide-react";
import { listPublishedCourses, listCategoriesWithCourses } from "@/server/queries/courses";
import { listBrands } from "@/server/queries/brands";
import { LEVELS } from "@/lib/constants";
import { CourseCard } from "@/components/course/course-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { Container, EmptyState, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Cursos",
  description: "Catálogo de cursos gratuitos sobre materiales de construcción y sus aplicaciones.",
};

const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function CursosPage({ searchParams }: PageProps<"/cursos">) {
  const sp = await searchParams;
  const filters = { categoria: str(sp.categoria), marca: str(sp.marca), nivel: str(sp.nivel), q: str(sp.q) };
  const [courses, categories, brands] = await Promise.all([listPublishedCourses(filters), listCategoriesWithCourses(), listBrands()]);
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <Container className="py-10">
      <PageHeader title="Cursos" description="Formación práctica y gratuita sobre materiales, sistemas constructivos y buenas prácticas de obra." />
      <form className="mb-8 grid gap-3 rounded-lg border border-ink-200 bg-ink-50 p-4 sm:grid-cols-2 lg:grid-cols-5" role="search">
        <div className="lg:col-span-2">
          <Label htmlFor="q">Buscar</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-500" aria-hidden />
            <Input id="q" name="q" defaultValue={filters.q} placeholder="Ej.: impermeabilización, bloque…" className="pl-9" />
          </div>
        </div>
        <div>
          <Label htmlFor="categoria">Categoría</Label>
          <Select id="categoria" name="categoria" defaultValue={filters.categoria ?? ""}>
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="marca">Marca</Label>
          <Select id="marca" name="marca" defaultValue={filters.marca ?? ""}>
            <option value="">Todas</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="nivel">Nivel</Label>
          <Select id="nivel" name="nivel" defaultValue={filters.nivel ?? ""}>
            <option value="">Todos</option>
            {Object.entries(LEVELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5 lg:justify-end">
          {hasFilters && (
            <ButtonLink href="/cursos" variant="ghost">
              Limpiar filtros
            </ButtonLink>
          )}
          <Button type="submit">Filtrar</Button>
        </div>
      </form>

      {courses.length === 0 ? (
        <EmptyState title="No encontramos cursos con esos filtros">Pruebe con otra categoría o término de búsqueda.</EmptyState>
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-600">
            {courses.length} {courses.length === 1 ? "curso" : "cursos"}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
