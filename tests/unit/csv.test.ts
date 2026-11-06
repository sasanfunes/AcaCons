import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("BOM, comillas y fórmulas", () => {
    expect(toCsv([["a", 'di "hola"', "=1+1", "x,y"]])).toBe('﻿a,"di ""hola""",\'=1+1,"x,y"\r\n');
  });
});

describe("toCsv teléfonos", () => {
  it("no altera +504", () => expect(toCsv([["+504 9999-9999", "-cmd"]])).toBe("﻿+504 9999-9999,'-cmd\r\n"));
});
