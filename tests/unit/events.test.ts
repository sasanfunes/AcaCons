import { describe, expect, it } from "vitest";
import { canRegister, nextRegistrationStatus, pickWaitlistToPromote, seatsLeft } from "@/lib/domain/events";

const now = new Date("2026-11-06T12:00:00Z");
const future = new Date("2026-12-01T15:00:00Z");

describe("nextRegistrationStatus", () => {
  it("confirma si hay cupo", () => expect(nextRegistrationStatus(9, 10)).toBe("CONFIRMED"));
  it("lista de espera si está lleno", () => expect(nextRegistrationStatus(10, 10)).toBe("WAITLISTED"));
});

describe("canRegister", () => {
  it("evento publicado y futuro", () =>
    expect(canRegister({ status: "PUBLISHED", startsAt: future, registrationClosesAt: null }, now)).toEqual({ ok: true }));
  it("borrador", () => expect(canRegister({ status: "DRAFT", startsAt: future, registrationClosesAt: null }, now).ok).toBe(false));
  it("ya comenzó", () =>
    expect(canRegister({ status: "PUBLISHED", startsAt: new Date("2026-11-01"), registrationClosesAt: null }, now).ok).toBe(false));
  it("inscripciones cerradas", () =>
    expect(
      canRegister({ status: "PUBLISHED", startsAt: future, registrationClosesAt: new Date("2026-11-05") }, now).ok,
    ).toBe(false));
});

describe("pickWaitlistToPromote", () => {
  const regs = [
    { id: "1", status: "CONFIRMED" as const, createdAt: new Date(1) },
    { id: "2", status: "WAITLISTED" as const, createdAt: new Date(5) },
    { id: "3", status: "WAITLISTED" as const, createdAt: new Date(3) },
    { id: "4", status: "CANCELLED" as const, createdAt: new Date(2) },
  ];
  it("promueve al más antiguo", () => expect(pickWaitlistToPromote(regs, 2).map((r) => r.id)).toEqual(["3"]));
  it("promueve varios si hay cupos", () => expect(pickWaitlistToPromote(regs, 5).map((r) => r.id)).toEqual(["3", "2"]));
  it("sin cupo no promueve", () => expect(pickWaitlistToPromote(regs, 1)).toEqual([]));
});

describe("seatsLeft", () => {
  it("nunca negativo", () => expect(seatsLeft(5, 7)).toBe(0));
});
