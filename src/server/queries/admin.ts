import "server-only";
import { db } from "@/lib/db";

export async function courseFormOptions() {
  const [categories, instructors, brands, sheets] = await Promise.all([
    db.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } }),
    db.instructor.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.technicalSheet.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, brand: { select: { name: true } } } }),
  ]);
  return { categories, instructors, brands, sheets: sheets.map((s) => ({ id: s.id, name: s.title, brand: s.brand.name })) };
}

export function getCourseForAdmin(id: string) {
  return db.course.findUnique({
    where: { id },
    include: {
      sponsors: { select: { id: true } },
      technicalSheets: { select: { id: true } },
      modules: { orderBy: { position: "asc" }, include: { lessons: { orderBy: { position: "asc" } } } },
      quizzes: { include: { module: { select: { title: true } }, _count: { select: { questions: true, attempts: true } } } },
      _count: { select: { enrollments: true, certificates: true } },
    },
  });
}

export async function adminDashboard() {
  const since = new Date(Date.now() - 30 * 86400_000);
  const [users, newUsers, enrollments, completions, certificates, events, byProfession, recentUsers] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: since } } }),
    db.enrollment.count(),
    db.enrollment.count({ where: { completedAt: { not: null } } }),
    db.certificate.count(),
    db.event.findMany({
      where: { status: "PUBLISHED", endsAt: { gt: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 5,
      include: { _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } },
    }),
    db.user.groupBy({ by: ["profession"], _count: true, orderBy: { _count: { profession: "desc" } } }),
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, createdAt: true, city: true } }),
  ]);
  return { users, newUsers, enrollments, completions, certificates, events, byProfession, recentUsers };
}
