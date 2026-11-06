import { DURATIONS } from "@/lib/domain/catalog";
import type { CatalogQuery } from "@/lib/domain/catalog";
import { LEVELS } from "@/lib/constants";
import { Button, ButtonLink } from "@/components/ui/button";

type Opt = { value: string; label: string; count?: number };

function Group({ title, name, options, selected }: { title: string; name: string; options: Opt[]; selected: string[] }) {
  if (options.length === 0) return null;
  return (
    <details open className="border-t border-ink-200 py-4">
      <summary className="cursor-pointer list-none text-base font-bold text-ink-900">{title}</summary>
      <div className="mt-3 space-y-2">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-3 text-sm text-ink-800">
            <input
              type="checkbox"
              name={name}
              value={o.value}
              defaultChecked={selected.includes(o.value)}
              className="h-4 w-4 rounded border-ink-900 accent-ink-900"
            />
            <span className="flex-1">{o.label}</span>
            {o.count !== undefined && <span className="text-xs text-ink-500">({o.count})</span>}
          </label>
        ))}
      </div>
    </details>
  );
}

/** Filtros del catálogo como formulario GET (funciona sin JavaScript). */
export function CatalogFilters({
  query,
  categories,
  brands,
}: {
  query: CatalogQuery;
  categories: { slug: string; name: string; count: number }[];
  brands: { slug: string; name: string }[];
}) {
  return (
    <form action="/cursos" className="text-sm">
      {query.q && <input type="hidden" name="q" value={query.q} />}
      {query.orden !== "relevancia" && <input type="hidden" name="orden" value={query.orden} />}
      <Group
        title="Categoría"
        name="categoria"
        selected={query.categorias}
        options={categories.map((c) => ({ value: c.slug, label: c.name, count: c.count }))}
      />
      <Group title="Nivel" name="nivel" selected={query.niveles} options={Object.entries(LEVELS).map(([value, label]) => ({ value, label }))} />
      <Group
        title="Duración"
        name="duracion"
        selected={query.duraciones}
        options={Object.entries(DURATIONS).map(([value, d]) => ({ value, label: d.label }))}
      />
      <Group title="Marca" name="marca" selected={query.marcas} options={brands.map((b) => ({ value: b.slug, label: b.name }))} />
      <div className="flex gap-2 border-t border-ink-200 pt-4">
        <Button type="submit" className="flex-1">
          Aplicar filtros
        </Button>
        <ButtonLink href={query.q ? `/cursos?q=${encodeURIComponent(query.q)}` : "/cursos"} variant="ghost">
          Limpiar
        </ButtonLink>
      </div>
    </form>
  );
}
