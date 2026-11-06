export type RegistrationStatus = "CONFIRMED" | "WAITLISTED" | "CANCELLED";

export function nextRegistrationStatus(confirmedCount: number, capacity: number): "CONFIRMED" | "WAITLISTED" {
  return confirmedCount < capacity ? "CONFIRMED" : "WAITLISTED";
}

export type RegistrableEvent = {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  startsAt: Date;
  registrationClosesAt: Date | null;
};

export type RegistrationCheck = { ok: true } | { ok: false; reason: string };

export function canRegister(event: RegistrableEvent, now: Date = new Date()): RegistrationCheck {
  if (event.status !== "PUBLISHED") return { ok: false, reason: "El evento no está disponible." };
  if (event.startsAt <= now) return { ok: false, reason: "El evento ya comenzó o finalizó." };
  if (event.registrationClosesAt && event.registrationClosesAt <= now) {
    return { ok: false, reason: "Las inscripciones están cerradas." };
  }
  return { ok: true };
}

/** Devuelve las inscripciones en espera a promover (las más antiguas primero) según los cupos libres. */
export function pickWaitlistToPromote<T extends { status: RegistrationStatus; createdAt: Date }>(
  registrations: readonly T[],
  capacity: number,
): T[] {
  const confirmed = registrations.filter((r) => r.status === "CONFIRMED").length;
  const free = Math.max(0, capacity - confirmed);
  if (free === 0) return [];
  return registrations
    .filter((r) => r.status === "WAITLISTED")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, free);
}

export function seatsLeft(capacity: number, confirmedCount: number): number {
  return Math.max(0, capacity - confirmedCount);
}
