import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export const eventCardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  coverKey: true,
  startsAt: true,
  endsAt: true,
  timezone: true,
  venueName: true,
  city: true,
  country: true,
  capacity: true,
  category: { select: { name: true } },
  sponsors: { select: { name: true, slug: true } },
  _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
} satisfies Prisma.EventSelect;

export type EventCardData = Prisma.EventGetPayload<{ select: typeof eventCardSelect }>;

export function upcomingEvents({ take, country }: { take?: number; country?: string } = {}) {
  return db.event.findMany({
    where: { status: "PUBLISHED", endsAt: { gt: new Date() }, ...(country ? { country } : {}) },
    select: eventCardSelect,
    orderBy: { startsAt: "asc" },
    take,
  });
}

export function pastEvents(take = 6) {
  return db.event.findMany({
    where: { status: "PUBLISHED", endsAt: { lte: new Date() } },
    select: eventCardSelect,
    orderBy: { startsAt: "desc" },
    take,
  });
}

export async function getEventBySlug(slug: string) {
  const event = await db.event.findUnique({
    where: { slug },
    include: {
      category: true,
      sponsors: { select: { id: true, name: true, slug: true, logoKey: true } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });
  if (!event || event.status !== "PUBLISHED") return null;
  return event;
}

export function getUserRegistration(userId: string | undefined, eventId: string) {
  if (!userId) return null;
  return db.eventRegistration.findUnique({ where: { eventId_userId: { eventId, userId } } });
}

export async function waitlistPosition(eventId: string, createdAt: Date) {
  return (await db.eventRegistration.count({ where: { eventId, status: "WAITLISTED", createdAt: { lt: createdAt } } })) + 1;
}
