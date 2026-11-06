import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { STATUS_LABELS } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Cursos" };

const tone = { DRAFT: "warning", PUBLISHED: "success", ARCHIVED: "neutral" } as const;

export default async function AdminCourses() {
  const courses = await db.course.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      _count: { select: { enrollments: true, certificates: true, modules: true } },
    },
  });
  return (
    <>
      <PageHeader title="Cursos" actions={<ButtonLink href="/admin/cursos/nuevo">Nuevo curso</ButtonLink>} />
      {courses.length === 0 ? (
        <EmptyState title="Todavía no hay cursos" action={<ButtonLink href="/admin/cursos/nuevo">Crear el primero</ButtonLink>} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-200 bg-ink-50 text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Módulos</th>
                <th className="px-4 py-3 text-right">Inscritos</th>
                <th className="px-4 py-3 text-right">Certificados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/cursos/${c.id}`} className="font-medium hover:text-brand-700">
                      {c.title}
                    </Link>
                    {c.featured && <span className="ml-2 text-xs text-brand-700">★ destacado</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{c.category.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone={tone[c.status]}>{STATUS_LABELS[c.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">{c._count.modules}</td>
                  <td className="px-4 py-3 text-right">{c._count.enrollments}</td>
                  <td className="px-4 py-3 text-right">{c._count.certificates}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
