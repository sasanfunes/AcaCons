import type { Metadata } from "next";
import { BrandForm } from "@/components/admin/misc-forms";
import { Card, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Nueva marca" };

export default function NewBrand() {
  return (
    <>
      <PageHeader title="Nueva marca" />
      <Card className="p-6">
        <BrandForm />
      </Card>
    </>
  );
}
