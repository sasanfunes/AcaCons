// Filtros y orden del catálogo de cursos (lógica pura, sin base de datos).

export const DURATIONS = {
  corto: { label: "0–1 hora", min: 0, max: 60 },
  medio: { label: "1–3 horas", min: 61, max: 180 },
  largo: { label: "Más de 3 horas", min: 181, max: null },
} as const;
export type DurationKey = keyof typeof DURATIONS;

export const SORTS = {
  relevancia: "Más relevantes",
  recientes: "Más recientes",
  populares: "Más populares",
  cortos: "Más cortos",
} as const;
export type SortKey = keyof typeof SORTS;

const LEVELS = ["INICIAL", "INTERMEDIO", "AVANZADO"] as const;

export type CatalogQuery = {
  q?: string;
  categorias: string[];
  marcas: string[];
  niveles: (typeof LEVELS)[number][];
  duraciones: DurationKey[];
  orden: SortKey;
};

type Raw = Record<string, string | string[] | undefined>;

function list(v: string | string[] | undefined): string[] {
  const arr = v === undefined ? [] : Array.isArray(v) ? v : [v];
  return [...new Set(arr.flatMap((x) => x.split(",")).map((x) => x.trim()).filter(Boolean))].slice(0, 20);
}

/** Interpreta los searchParams del catálogo (acepta valores repetidos o separados por coma). */
export function parseCatalogQuery(sp: Raw): CatalogQuery {
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const orden = typeof sp.orden === "string" && sp.orden in SORTS ? (sp.orden as SortKey) : "relevancia";
  return {
    q: q || undefined,
    categorias: list(sp.categoria),
    marcas: list(sp.marca),
    niveles: list(sp.nivel).filter((n): n is (typeof LEVELS)[number] => (LEVELS as readonly string[]).includes(n)),
    duraciones: list(sp.duracion).filter((d): d is DurationKey => d in DURATIONS),
    orden,
  };
}

/** Rango(s) de minutos para el filtro de duración (OR entre los seleccionados). */
export function durationRanges(keys: DurationKey[]) {
  return keys.map((k) => ({ min: DURATIONS[k].min, max: DURATIONS[k].max }));
}

export function hasFilters(q: CatalogQuery) {
  return !!q.q || q.categorias.length + q.marcas.length + q.niveles.length + q.duraciones.length > 0;
}

/** Arma la URL del catálogo cambiando un parámetro (para enlaces de filtros y orden). */
export function catalogHref(q: CatalogQuery, patch: Partial<CatalogQuery> = {}): string {
  const next = { ...q, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  next.categorias.forEach((c) => params.append("categoria", c));
  next.marcas.forEach((m) => params.append("marca", m));
  next.niveles.forEach((n) => params.append("nivel", n));
  next.duraciones.forEach((d) => params.append("duracion", d));
  if (next.orden !== "relevancia") params.set("orden", next.orden);
  const s = params.toString();
  return s ? `/cursos?${s}` : "/cursos";
}
