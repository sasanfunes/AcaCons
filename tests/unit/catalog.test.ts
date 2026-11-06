import { describe, expect, it } from "vitest";
import { catalogHref, durationRanges, hasFilters, parseCatalogQuery } from "@/lib/domain/catalog";

describe("parseCatalogQuery", () => {
  it("valores repetidos y separados por coma, sin duplicados", () => {
    const q = parseCatalogQuery({ categoria: ["a", "b,a"], nivel: "INICIAL,FALSO", duracion: ["corto", "eterno"], q: "  losa " });
    expect(q).toEqual({ q: "losa", categorias: ["a", "b"], marcas: [], niveles: ["INICIAL"], duraciones: ["corto"], orden: "relevancia" });
  });
  it("orden inválido vuelve a relevancia", () => {
    expect(parseCatalogQuery({ orden: "drop table" }).orden).toBe("relevancia");
    expect(parseCatalogQuery({ orden: "populares" }).orden).toBe("populares");
  });
  it("hasFilters", () => {
    expect(hasFilters(parseCatalogQuery({}))).toBe(false);
    expect(hasFilters(parseCatalogQuery({ marca: "x" }))).toBe(true);
  });
});

describe("durationRanges", () => {
  it("rangos en minutos", () => {
    expect(durationRanges(["corto", "largo"])).toEqual([
      { min: 0, max: 60 },
      { min: 181, max: null },
    ]);
  });
});

describe("catalogHref", () => {
  it("serializa y aplica cambios", () => {
    const q = parseCatalogQuery({ q: "techo", categoria: "techos" });
    expect(catalogHref(q)).toBe("/cursos?q=techo&categoria=techos");
    expect(catalogHref(q, { orden: "recientes", categorias: [] })).toBe("/cursos?q=techo&orden=recientes");
    expect(catalogHref(parseCatalogQuery({}))).toBe("/cursos");
  });
});
