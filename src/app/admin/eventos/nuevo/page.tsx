import type { Metadata } from "next";
import { db } from "@/lib/db";
import { EventForm } from "@/components/admin/event-forms";
import { Card, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Nuevo evento" };

export default async function NewEvent() {
  const [categories, brands] = await Promise.all([
    db.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } }),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <>
      <PageHeader title="Nuevo evento presencial" />
      <Card className="p-6">
        <EventForm categories={categories} brands={brands} />
      </Card>
    </>
  );
}
