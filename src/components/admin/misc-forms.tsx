"use client";
import { useActionState, useEffect, useRef } from "react";
import {
  addSheetAction,
  deleteCategoryAction,
  saveBrandAction,
  saveCategoryAction,
  saveInstructorAction,
} from "@/server/actions/admin";
import { initialState, type ActionState } from "@/lib/validation/action";
import { STATUS_LABELS } from "@/lib/constants";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "./form-feedback";

function useReset(state: ActionState, enabled: boolean) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (enabled && state.ok) ref.current?.reset();
  }, [state, enabled]);
  return ref;
}

export function BrandForm({
  brand,
}: {
  brand?: { id: string; name: string; slug: string; description: string; website: string | null; status: string };
}) {
  const [state, action] = useActionState(saveBrandAction, initialState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" encType="multipart/form-data">
      <FormFeedback state={state} />
      {brand && <input type="hidden" name="id" value={brand.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre" htmlFor="name" error={e.name}>
          <Input id="name" name="name" defaultValue={brand?.name} required />
        </Field>
        <Field label="Slug (URL)" htmlFor="slug" error={e.slug}>
          <Input id="slug" name="slug" defaultValue={brand?.slug} />
        </Field>
      </div>
      <Field label="Descripción" htmlFor="description" error={e.description}>
        <Textarea id="description" name="description" defaultValue={brand?.description} rows={4} required />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Sitio web" htmlFor="website" error={e.website}>
          <Input id="website" name="website" type="url" defaultValue={brand?.website ?? ""} placeholder="https://" />
        </Field>
        <Field label="Logo" htmlFor="logo" error={e.logo} hint="Cuadrado, PNG/SVG, máx. 5 MB.">
          <Input id="logo" name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="py-1.5" />
        </Field>
        <Field label="Estado" htmlFor="status">
          <Select id="status" name="status" defaultValue={brand?.status ?? "PUBLISHED"}>
            {Object.entries(STATUS_LABELS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <SubmitButton pendingText="Guardando…">{brand ? "Guardar cambios" : "Crear marca"}</SubmitButton>
    </form>
  );
}

export function SheetForm({ brandId, categories, maxMb = 20 }: { brandId: string; categories: { id: string; name: string }[]; maxMb?: number }) {
  const [state, action] = useActionState(addSheetAction, initialState);
  const ref = useReset(state, true);
  const e = state.fieldErrors ?? {};
  return (
    <form ref={ref} action={action} className="space-y-3" encType="multipart/form-data">
      <FormFeedback state={state} />
      <input type="hidden" name="brandId" value={brandId} />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Título" htmlFor="sheet-title" error={e.title}>
          <Input id="sheet-title" name="title" placeholder="Ficha técnica: …" required />
        </Field>
        <Field label="Producto" htmlFor="sheet-product">
          <Input id="sheet-product" name="productName" />
        </Field>
        <Field label="Categoría" htmlFor="sheet-cat">
          <Select id="sheet-cat" name="categoryId" defaultValue="">
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={`Archivo PDF (máx. ${maxMb} MB)`} htmlFor="sheet-file" error={e.file}>
          <Input id="sheet-file" name="file" type="file" accept="application/pdf" className="py-1.5" required />
        </Field>
      </div>
      <SubmitButton size="sm" pendingText="Subiendo…">
        Subir ficha técnica
      </SubmitButton>
    </form>
  );
}

export function CategoryForm({
  category,
}: {
  category?: { id: string; name: string; slug: string; description: string | null; position: number };
}) {
  const [state, action] = useActionState(saveCategoryAction, initialState);
  const [delState, delAction] = useActionState(deleteCategoryAction, initialState);
  const ref = useReset(state, !category);
  const e = state.fieldErrors ?? {};
  return (
    <div className="space-y-2">
      <form ref={ref} action={action} className="grid gap-2 md:grid-cols-[2fr_2fr_3fr_80px_auto] md:items-start">
        {category && <input type="hidden" name="id" value={category.id} />}
        <div>
          <Input name="name" defaultValue={category?.name} placeholder="Nombre" aria-label="Nombre" required />
          {e.name && <p className="text-xs text-red-600">{e.name[0]}</p>}
        </div>
        <Input name="slug" defaultValue={category?.slug} placeholder="slug (opcional)" aria-label="Slug" />
        <Input name="description" defaultValue={category?.description ?? ""} placeholder="Descripción" aria-label="Descripción" />
        <Input name="position" type="number" min={0} defaultValue={category?.position ?? 0} aria-label="Orden" />
        <SubmitButton size="md" variant={category ? "outline" : "secondary"} pendingText="…">
          {category ? "Guardar" : "Agregar"}
        </SubmitButton>
      </form>
      {category && (
        <form action={delAction}>
          <input type="hidden" name="id" value={category.id} />
          <Button type="submit" variant="ghost" size="sm" className="text-red-700">
            Eliminar
          </Button>
        </form>
      )}
      <FormFeedback state={delState.error ? delState : state.ok ? state : {}} />
    </div>
  );
}

export function InstructorForm({ instructor }: { instructor?: { id: string; name: string; title: string | null; bio: string | null } }) {
  const [state, action] = useActionState(saveInstructorAction, initialState);
  const ref = useReset(state, !instructor);
  const e = state.fieldErrors ?? {};
  const k = instructor?.id ?? "new";
  return (
    <form ref={ref} action={action} className="space-y-3">
      <FormFeedback state={state} />
      {instructor && <input type="hidden" name="id" value={instructor.id} />}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nombre" htmlFor={`in-${k}`} error={e.name}>
          <Input id={`in-${k}`} name="name" defaultValue={instructor?.name} placeholder="Ing. Nombre Apellido" required />
        </Field>
        <Field label="Título / especialidad" htmlFor={`it-${k}`}>
          <Input id={`it-${k}`} name="title" defaultValue={instructor?.title ?? ""} />
        </Field>
      </div>
      <Field label="Biografía breve" htmlFor={`ib-${k}`}>
        <Textarea id={`ib-${k}`} name="bio" defaultValue={instructor?.bio ?? ""} rows={2} />
      </Field>
      <SubmitButton size="sm" pendingText="Guardando…">
        {instructor ? "Guardar" : "Agregar instructor"}
      </SubmitButton>
    </form>
  );
}
