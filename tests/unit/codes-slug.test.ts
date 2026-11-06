import { describe, expect, it } from "vitest";
import { generateCode, normalizeCode } from "@/lib/domain/codes";
import { slugify } from "@/lib/domain/slug";

describe("generateCode", () => {
  it("formato", () => expect(generateCode("CERT")).toMatch(/^CERT-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/));
  it("no se repite", () => {
    const set = new Set(Array.from({ length: 2000 }, () => generateCode("TKT")));
    expect(set.size).toBe(2000);
  });
});

describe("normalizeCode", () => {
  it("corrige letras ambiguas y minúsculas", () => expect(normalizeCode(" cert-7k3m-q9xd-2hpo ")).toBe("CERT-7K3M-Q9XD-2HP0"));
  it("agrega guion tras el prefijo", () => expect(normalizeCode("CERT7K3M-Q9XD-2HPA")).toBe("CERT-7K3M-Q9XD-2HPA"));
});

describe("slugify", () => {
  it("tildes y ñ", () => expect(slugify("Impermeabilización de Losas y Baños")).toBe("impermeabilizacion-de-losas-y-banos"));
  it("símbolos", () => expect(slugify("  Bloques de concreto 15×20×40 cm!! ")).toBe("bloques-de-concreto-15-20-40-cm"));
});
