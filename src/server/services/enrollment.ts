import "server-only";
import { db } from "@/lib/db";

export class DomainError extends Error {}

export async function enroll(userId: string, courseId: string) {
  const course = await db.course.findUnique({ where: { id: courseId }, select: { status: true } });
  if (!course || course.status !== "PUBLISHED") throw new DomainError("El curso no está disponible.");
  return db.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  });
}

export async function getEnrollment(userId: string, courseId: string) {
  return db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
}
