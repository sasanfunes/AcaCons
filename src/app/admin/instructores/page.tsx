import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deleteInstructorAction } from "@/server/actions/admin";
import { InstructorForm } from "@/components/admin/misc-forms";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Card, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Instructores" };

export default async function AdminInstructors() {
  const instructors = await db.instructor.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { courses: true } } } });
  return (
    <>
      <PageHeader title="Instructores" />
      <Card className="mb-6 p-5">
        <h2 className="mb-3 font-semibold">Nuevo instructor</h2>
        <InstructorForm />
      </Card>
      <div className="space-y-3">
        {instructors.map((i) => (
          <Card key={i.id} className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-ink-500">{i._count.courses} cursos</p>
              <form action={deleteInstructorAction}>
                <input type="hidden" name="id" value={i.id} />
                <ConfirmButton message="¿Eliminar el instructor? Los cursos quedarán sin instructor asignado." className="text-red-700">
                  <Trash2 className="h-4 w-4" aria-hidden /> Eliminar
                </ConfirmButton>
              </form>
            </div>
            <InstructorForm instructor={i} />
          </Card>
        ))}
      </div>
    </>
  );
}
