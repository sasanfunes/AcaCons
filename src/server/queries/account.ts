import "server-only";
import { db } from "@/lib/db";
import { courseProgress, nextPendingLesson } from "@/lib/domain/progress";
import { courseCardSelect } from "./courses";
import { eventCardSelect } from "./events";

export async function getMyCourses(userId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        select: {
          ...courseCardSelect,
          modules: {
            orderBy: { position: "asc" },
            select: { _count: { select: { lessons: true } }, lessons: { orderBy: { position: "asc" }, select: { id: true } } },
          },
        },
      },
    },
  });
  const done = await db.lessonProgress.findMany({ where: { userId }, select: { lessonId: true } });
  const doneIds = done.map((d) => d.lessonId);
  return enrollments.map((e) => {
    const lessonIds = e.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const progress = e.completedAt ? 100 : courseProgress(lessonIds, doneIds);
    const next = nextPendingLesson(lessonIds, doneIds);
    return { ...e, progress, nextHref: next && progress > 0 ? `/cursos/${e.course.slug}/leccion/${next}` : `/cursos/${e.course.slug}` };
  });
}

export function getMyRegistrations(userId: string) {
  return db.eventRegistration.findMany({
    where: { userId, status: { not: "CANCELLED" } },
    include: { event: { select: eventCardSelect } },
    orderBy: { event: { startsAt: "asc" } },
  });
}

export function getMyRegistration(userId: string, eventId: string) {
  return db.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId } },
    include: { event: true, user: { select: { name: true, email: true } } },
  });
}

export function getMyProfile(userId: string) {
  return db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true, profession: true, company: true, country: true, department: true, city: true, phone: true, emailVerified: true },
  });
}
