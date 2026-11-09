import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { db } from "@/lib/db";

// Se genera en cada solicitud para reflejar cursos y eventos nuevos (y no requiere la base durante el build).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.APP_URL;
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
