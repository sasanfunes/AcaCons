import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CategoryForm } from "@/components/admin/misc-forms";
import { Card, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Categorías" };

export default async function AdminCategories() {
  const categories = await db.category.findMany({ orderBy: { position: "asc" }, include: { _count: { select: { courses: true } } } });
  return (
    <>
      <PageHeader title="Categorías" description="Organizan el catálogo de cursos, eventos y fichas técnicas por tipo de material o sistema." />
      <Card className="mb-6 p-5">
        <h2 className="mb-3 font-semibold">Nueva categoría</h2>
        <CategoryForm />
      </Card>
      <Card className="divide-y divide-ink-100">
        {categories.map((c) => (
          <div key={c.id} className="p-4">
            <p className="mb-2 text-xs text-ink-500">{c._count.courses} cursos</p>
            <CategoryForm category={c} />
          </div>
        ))}
      </Card>
    </>
  );
}
