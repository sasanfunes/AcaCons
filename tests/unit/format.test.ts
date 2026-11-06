import { describe, expect, it } from "vitest";
import { formatDuration, utcToZonedLocal, zonedLocalToUtc } from "@/lib/format";

describe("zonas horarias", () => {
  it("Tegucigalpa es UTC-6", () => {
    expect(zonedLocalToUtc("2026-12-05T08:00", "America/Tegucigalpa").toISOString()).toBe("2026-12-05T14:00:00.000Z");
  });
  it("Panamá es UTC-5", () => {
    expect(zonedLocalToUtc("2026-12-05T08:00", "America/Panama").toISOString()).toBe("2026-12-05T13:00:00.000Z");
  });
  it("ida y vuelta", () => {
    const d = zonedLocalToUtc("2027-01-15T17:30", "America/Tegucigalpa");
    expect(utcToZonedLocal(d, "America/Tegucigalpa")).toBe("2027-01-15T17:30");
  });
});

describe("formatDuration", () => {
  it.each([
    [45, "45 min"],
    [60, "1 h"],
    [95, "1 h 35 min"],
  ])("%i", (m, s) => expect(formatDuration(m)).toBe(s));
});
