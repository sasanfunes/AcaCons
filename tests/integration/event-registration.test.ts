import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { cancelRegistration, checkInByTicket, rebalanceWaitlist, registerForEvent } from "@/server/services/event-registration";
import { createEvent, createUser, resetDb } from "./helpers";

describe("inscripción a eventos", () => {
  beforeEach(resetDb);

  it("confirma hasta el cupo y luego pone en lista de espera", async () => {
    const event = await createEvent(1);
    const a = await createUser();
    const b = await createUser();
    expect((await registerForEvent(a.id, event.id)).status).toBe("CONFIRMED");
    expect((await registerForEvent(b.id, event.id)).status).toBe("WAITLISTED");
  });

  it("es idempotente", async () => {
    const event = await createEvent(5);
    const a = await createUser();
    const r1 = await registerForEvent(a.id, event.id);
    const r2 = await registerForEvent(a.id, event.id);
    expect(r2.id).toBe(r1.id);
    expect(await db.eventRegistration.count()).toBe(1);
  });

  it("al cancelar promueve al primero de la lista de espera", async () => {
    const event = await createEvent(1);
    const [a, b, c] = [await createUser(), await createUser(), await createUser()];
    await registerForEvent(a.id, event.id);
    await registerForEvent(b.id, event.id);
    await registerForEvent(c.id, event.id);
    await cancelRegistration(a.id, event.id);
    const regs = await db.eventRegistration.findMany({ where: { eventId: event.id } });
    const byUser = Object.fromEntries(regs.map((r) => [r.userId, r.status]));
    expect(byUser).toEqual({ [a.id]: "CANCELLED", [b.id]: "CONFIRMED", [c.id]: "WAITLISTED" });
  });

  it("reinscribirse tras cancelar reutiliza la entrada", async () => {
    const event = await createEvent(2);
    const a = await createUser();
    const r1 = await registerForEvent(a.id, event.id);
    await cancelRegistration(a.id, event.id);
    const r2 = await registerForEvent(a.id, event.id);
    expect(r2.id).toBe(r1.id);
    expect(r2.ticketCode).toBe(r1.ticketCode);
    expect(r2.status).toBe("CONFIRMED");
  });

  it("no supera el cupo con inscripciones concurrentes", async () => {
    const event = await createEvent(3);
    const users = await Promise.all(Array.from({ length: 10 }, () => createUser()));
    await Promise.all(users.map((u) => registerForEvent(u.id, event.id)));
    expect(await db.eventRegistration.count({ where: { eventId: event.id, status: "CONFIRMED" } })).toBe(3);
    expect(await db.eventRegistration.count({ where: { eventId: event.id, status: "WAITLISTED" } })).toBe(7);
  });

  it("al aumentar el cupo promueve la lista de espera", async () => {
    const event = await createEvent(1);
    const [a, b, c] = [await createUser(), await createUser(), await createUser()];
    for (const u of [a, b, c]) await registerForEvent(u.id, event.id);
    await db.event.update({ where: { id: event.id }, data: { capacity: 2 } });
    expect(await rebalanceWaitlist(event.id)).toBe(1);
    expect((await db.eventRegistration.findFirstOrThrow({ where: { userId: b.id } })).status).toBe("CONFIRMED");
  });

  it("rechaza eventos no publicados", async () => {
    const event = await createEvent(5);
    await db.event.update({ where: { id: event.id }, data: { status: "DRAFT" } });
    await expect(registerForEvent((await createUser()).id, event.id)).rejects.toThrow(/no está disponible/);
  });

  it("check-in por código de entrada", async () => {
    const event = await createEvent(1);
    const a = await createUser();
    const b = await createUser();
    const ra = await registerForEvent(a.id, event.id);
    const rb = await registerForEvent(b.id, event.id);
    expect((await checkInByTicket(event.id, ra.ticketCode)).alreadyCheckedIn).toBe(false);
    expect((await checkInByTicket(event.id, ra.ticketCode)).alreadyCheckedIn).toBe(true);
    await expect(checkInByTicket(event.id, rb.ticketCode)).rejects.toThrow(/no está confirmada/);
    await expect(checkInByTicket(event.id, "TKT-XXXX-XXXX-XXXX")).rejects.toThrow(/no encontrado/);
  });
});
