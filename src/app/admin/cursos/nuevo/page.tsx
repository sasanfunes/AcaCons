import type { Metadata } from "next";
import Link from "next/link";
import { courseFormOptions } from "@/server/queries/admin";
import { CourseForm } from "@/components/admin/course-forms";
import { Alert, Card, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Nuevo curso" };

export default async function NewCourse() {
  const opts = await courseFormOptions();
  return (
    <>
      <PageHeader title="Nuevo curso" description="Primero cree el curso; luego podrá agregar módulos, lecciones y evaluaciones." />
      {opts.categories.length === 0 ? (
        <Alert tone="danger">
          Antes de crear un curso necesita al menos una <Link href="/admin/categorias" className="underline">categoría</Link>.
        </Alert>
      ) : (
        <Card className="p-6">
          <CourseForm {...opts} />
        </Card>
      )}
    </>
  );
}
