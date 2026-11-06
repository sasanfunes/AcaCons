import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deleteBrandAction, deleteSheetAction } from "@/server/actions/admin";
import { formatBytes } from "@/lib/format";
import { fileUrl } from "@/lib/storage/url";
import { BrandForm, SheetForm } from "@/components/admin/misc-forms";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Alert, Card, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Editar marca" };

export default async function EditBrand({ params, searchParams }: PageProps<"/admin/marcas/[id]">) {
  const { id } = await params;
  const { creado } = await searchParams;
  const [brand, categories] = await Promise.all([
    db.brand.findUnique({ where: { id }, include: { technicalSheets: { orderBy: { createdAt: "desc" } } } }),
    db.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!brand) notFound();
  return (
    <>
      <PageHeader
        title={brand.name}
        actions={
          <form action={deleteBrandAction}>
            <input type="hidden" name="id" value={brand.id} />
            <ConfirmButton message="¿Eliminar la marca y todas sus fichas técnicas?" className="text-red-700">
              <Trash2 className="h-4 w-4" aria-hidden /> Eliminar
            </ConfirmButton>
          </form>
        }
      />
      {creado && <Alert tone="success" className="mb-4">Marca creada. Ya puede subir sus fichas técnicas.</Alert>}
      <div className="space-y-6">
        <Card className="p-6">
          <BrandForm brand={brand} />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-bold">Fichas técnicas ({brand.technicalSheets.length})</h2>
          {brand.technicalSheets.length > 0 && (
            <ul className="mb-6 divide-y divide-ink-100 rounded-md border border-ink-200">
              {brand.technicalSheets.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <FileText className="h-5 w-5 text-red-600" aria-hidden />
                  <a href={fileUrl(s.fileKey)!} target="_blank" rel="noopener" className="flex-1 font-medium hover:text-brand-700">
                    {s.title}
                  </a>
                  <span className="text-xs text-ink-500">{formatBytes(s.fileSize)}</span>
                  <form action={deleteSheetAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmButton message="¿Eliminar esta ficha técnica?" aria-label={`Eliminar ${s.title}`}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <SheetForm brandId={brand.id} categories={categories} />
        </Card>
      </div>
    </>
  );
}
