import "server-only";
import { db } from "@/lib/db";
import { courseCardSelect } from "./courses";
import { eventCardSelect } from "./events";

export function listBrands() {
  return db.brand.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      logoKey: true,
      description: true,
      _count: { select: { sponsoredCourses: { where: { status: "PUBLISHED" } }, technicalSheets: true } },
    },
  });
}

export async function getBrandBySlug(slug: string) {
  const brand = await db.brand.findUnique({
    where: { slug },
    include: {
      technicalSheets: { orderBy: { title: "asc" }, include: { category: { select: { name: true } } } },
      sponsoredCourses: { where: { status: "PUBLISHED" }, select: courseCardSelect },
      sponsoredEvents: {
        where: { status: "PUBLISHED", endsAt: { gt: new Date() } },
        select: eventCardSelect,
        orderBy: { startsAt: "asc" },
      },
    },
  });
  if (!brand || brand.status !== "PUBLISHED") return null;
  return brand;
}
