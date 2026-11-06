import "server-only";
import { db } from "@/lib/db";
import { generateCode } from "@/lib/domain/codes";
import { canRegister, nextRegistrationStatus } from "@/lib/domain/events";
import { sendEmail } from "@/lib/email";
import { eventRegistrationEmail, waitlistPromotedEmail } from "@/lib/email/templates";
import { formatEventRange } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";
import { DomainError } from "./enrollment";

type Tx = Prisma.TransactionClient;

async function lockEvent(tx: Tx, eventId: string) {
  // Bloquea la fila del evento: serializa inscripciones/cancelaciones concurrentes del mismo evento.
  await tx.$executeRaw`SELECT id FROM "event" WHERE id = ${eventId} FOR UPDATE`;
  const event = await tx.event.findUnique({ where: { id: eventId } });
  if (!event) throw new DomainError("Evento no encontrado.");
  return event;
}

const countConfirmed = (tx: Tx, eventId: string) => tx.eventRegistration.count({ where: { eventId, status: "CONFIRMED" } });

function eventInfo(e: { title: string; slug: string; startsAt: Date; endsAt: Date; timezone: string; venueName: string; address: string; city: string }) {
  return {
    title: e.title,
    slug: e.slug,
    when: formatEventRange(e.startsAt, e.endsAt, e.timezone),
    venue: `${e.venueName}, ${e.address}, ${e.city}`,
  };
}

async function notify(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e) {
    console.error("No se pudo enviar el email de evento", e);
  }
}

export async function registerForEvent(userId: string, eventId: string) {
  const { registration, event } = await db.$transaction(async (tx) => {
    const event = await lockEvent(tx, eventId);
    const check = canRegister(event);
    if (!check.ok) throw new DomainError(check.reason);
    const existing = await tx.eventRegistration.findUnique({ where: { eventId_userId: { eventId, userId } } });
    if (existing && existing.status !== "CANCELLED") return { registration: existing, event, already: true };
    const status = nextRegistrationStatus(await countConfirmed(tx, eventId), event.capacity);
    const registration = existing
      ? await tx.eventRegistration.update({
          where: { id: existing.id },
          // Al reinscribirse vuelve al final de la lista de espera.
          data: { status, cancelledAt: null, checkedInAt: null, createdAt: new Date() },
        })
      : await tx.eventRegistration.create({ data: { eventId, userId, status, ticketCode: generateCode("TKT") } });
    return { registration, event, already: false };
  });
  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  if (user && registration.status !== "CANCELLED") {
    await notify(() =>
      sendEmail({
        to: user.email,
        ...eventRegistrationEmail(user.name, eventInfo(event), registration.status as "CONFIRMED" | "WAITLISTED", registration.ticketCode),
      }),
    );
  }
  return registration;
}

export async function cancelRegistration(userId: string, eventId: string) {
  const { promoted, event } = await db.$transaction(async (tx) => {
    const event = await lockEvent(tx, eventId);
    const reg = await tx.eventRegistration.findUnique({ where: { eventId_userId: { eventId, userId } } });
    if (!reg || reg.status === "CANCELLED") throw new DomainError("No tiene una inscripción activa en este evento.");
    if (event.startsAt <= new Date()) throw new DomainError("El evento ya comenzó; no es posible cancelar.");
    await tx.eventRegistration.update({ where: { id: reg.id }, data: { status: "CANCELLED", cancelledAt: new Date() } });
    const promoted = reg.status === "CONFIRMED" ? await promoteFromWaitlist(tx, eventId, event.capacity) : [];
    return { promoted, event };
  });
  for (const p of promoted) {
    await notify(() => sendEmail({ to: p.user.email, ...waitlistPromotedEmail(p.user.name, eventInfo(event), p.ticketCode) }));
  }
}

/** Promueve inscripciones en espera mientras haya cupos (también se usa al aumentar la capacidad). */
async function promoteFromWaitlist(tx: Tx, eventId: string, capacity: number) {
  const free = capacity - (await countConfirmed(tx, eventId));
  if (free <= 0) return [];
  const next = await tx.eventRegistration.findMany({
    where: { eventId, status: "WAITLISTED" },
    orderBy: { createdAt: "asc" },
    take: free,
    include: { user: { select: { name: true, email: true } } },
  });
  if (next.length) {
    await tx.eventRegistration.updateMany({ where: { id: { in: next.map((n) => n.id) } }, data: { status: "CONFIRMED" } });
  }
  return next;
}

/** Se llama tras editar la capacidad de un evento desde el admin. */
export async function rebalanceWaitlist(eventId: string) {
  const { promoted, event } = await db.$transaction(async (tx) => {
    const event = await lockEvent(tx, eventId);
    return { promoted: await promoteFromWaitlist(tx, eventId, event.capacity), event };
  });
  for (const p of promoted) {
    await notify(() => sendEmail({ to: p.user.email, ...waitlistPromotedEmail(p.user.name, eventInfo(event), p.ticketCode) }));
  }
  return promoted.length;
}

export async function checkInByTicket(eventId: string, ticketCode: string) {
  const reg = await db.eventRegistration.findUnique({
    where: { ticketCode },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!reg || reg.eventId !== eventId) throw new DomainError("Código de entrada no encontrado para este evento.");
  if (reg.status !== "CONFIRMED") throw new DomainError(`La inscripción de ${reg.user.name} no está confirmada.`);
  if (reg.checkedInAt) return { registration: reg, alreadyCheckedIn: true };
  const updated = await db.eventRegistration.update({
    where: { id: reg.id },
    data: { checkedInAt: new Date() },
    include: { user: { select: { name: true, email: true } } },
  });
  return { registration: updated, alreadyCheckedIn: false };
}
