import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { STATUS_LABELS } from "@/lib/constants";
import { Logo } from "@/components/ui/cover";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Marcas" };

export default async function AdminBrands() {
  const brands = await db.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { technicalSheets: true, sponsoredCourses: true, sponsoredEvents: true } } },
  });
  return (
    <>
      <PageHeader title="Marcas y fabricantes" actions={<ButtonLink href="/admin/marcas/nuevo">Nueva marca</ButtonLink>} />
      {brands.length === 0 ? (
        <EmptyState title="Todavía no hay marcas" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {brands.map((b) => (
            <Link key={b.id} href={`/admin/marcas/${b.id}`}>
              <Card className="flex gap-4 p-4 hover:shadow-md">
                <Logo fileKey={b.logoKey} alt={b.name} className="h-14 w-14 shrink-0" />
                <div>
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs text-ink-500">
                    {b._count.sponsoredCourses} cursos · {b._count.sponsoredEvents} eventos · {b._count.technicalSheets} fichas
                  </p>
                  {b.status !== "PUBLISHED" && <Badge tone="warning" className="mt-1">{STATUS_LABELS[b.status]}</Badge>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
