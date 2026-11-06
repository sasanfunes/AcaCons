import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const [courses, events, brands] = await Promise.all([
    db.course.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.event.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.brand.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);
  return [
    ...["", "/cursos", "/eventos", "/marcas", "/certificados/verificar"].map((p) => ({ url: `${base}${p}` })),
    ...courses.map((c) => ({ url: `${base}/cursos/${c.slug}`, lastModified: c.updatedAt })),
    ...events.map((e) => ({ url: `${base}/eventos/${e.slug}`, lastModified: e.updatedAt })),
    ...brands.map((b) => ({ url: `${base}/marcas/${b.slug}`, lastModified: b.updatedAt })),
  ];
}
