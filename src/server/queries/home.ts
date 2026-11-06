import "server-only";
import { db } from "@/lib/db";

export async function homeStats() {
  const [courses, events, brands, certificates] = await Promise.all([
    db.course.count({ where: { status: "PUBLISHED" } }),
    db.event.count({ where: { status: "PUBLISHED", startsAt: { gt: new Date() } } }),
    db.brand.count({ where: { status: "PUBLISHED" } }),
    db.certificate.count(),
  ]);
  return { courses, events, brands, certificates };
}
