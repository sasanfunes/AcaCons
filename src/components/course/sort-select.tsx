"use client";
import { useRouter } from "next/navigation";
import { SORTS, catalogHref, type CatalogQuery, type SortKey } from "@/lib/domain/catalog";

export function SortSelect({ query }: { query: CatalogQuery }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-semibold text-ink-900">Ordenar por</span>
      <select
        value={query.orden}
        onChange={(e) => router.push(catalogHref(query, { orden: e.target.value as SortKey }))}
        className="h-10 rounded-md border border-ink-900 bg-white px-3 text-sm font-medium"
      >
        {Object.entries(SORTS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
}
