"use client";
import { useActionState, useState } from "react";
import { checkInAction, saveEventAction } from "@/server/actions/admin";
import { initialState } from "@/lib/validation/action";
import { COUNTRIES, HONDURAS_DEPARTMENTS, STATUS_LABELS, TIMEZONES } from "@/lib/constants";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormFeedback } from "./form-feedback";

type Opt = { id: string; name: string };
export type EventFormValues = {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  description?: string;
  timezone?: string;
  startsAt?: string;
  endsAt?: string;
  registrationClosesAt?: string;
  venueName?: string;
  address?: string;
  city?: string;
  department?: string | null;
  country?: string;
  mapUrl?: string | null;
  capacity?: number;
  categoryId?: string | null;
  status?: string;
  sponsorIds?: string[];
};

export function EventForm({ event, categories, brands }: { event?: EventFormValues; categories: Opt[]; brands: Opt[] }) {
  const [state, action] = useActionState(saveEventAction, initialState);
  const e = state.fieldErrors ?? {};
  const v = { ...event, ...(state.values ?? {}) } as EventFormValues;
  const [country, setCountry] = useState(event?.country ?? "HN");
  return (
    <form action={action} className="space-y-4" encType="multipart/form-data">
      <FormFeedback state={state} />
      {event?.id && <input type="hidden" name="id" value={event.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título" htmlFor="title" error={e.title}>
          <Input id="title" name="title" defaultValue={v.title} required />
        </Field>
        <Field label="Slug (URL)" htmlFor="slug" error={e.slug} hint="Se genera del título si lo deja vacío.">
          <Input id="slug" name="slug" defaultValue={v.slug} />
        </Field>
      </div>
      <Field label="Resumen" htmlFor="summary" error={e.summary}>
        <Textarea id="summary" name="summary" defaultValue={v.summary} rows={2} required />
      </Field>
      <Field label="Descripción / agenda" htmlFor="description" hint="Formato simple: ## títulos, - listas, **negrita**.">
        <Textarea id="description" name="description" defaultValue={v.description} rows={7} />
      </Field>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Inicio" htmlFor="startsAt" error={e.startsAt}>
          <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={v.startsAt} required />
        </Field>
        <Field label="Fin" htmlFor="endsAt" error={e.endsAt}>
          <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={v.endsAt} required />
        </Field>
        <Field label="Cierre de inscripciones (opcional)" htmlFor="registrationClosesAt">
          <Input id="registrationClosesAt" name="registrationClosesAt" type="datetime-local" defaultValue={v.registrationClosesAt} />
        </Field>
        <Field label="Zona horaria" htmlFor="timezone" hint="Las horas se interpretan en esta zona.">
          <Select id="timezone" name="timezone" defaultValue={v.timezone ?? "America/Tegucigalpa"}>
            {Object.entries(TIMEZONES).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Lugar" htmlFor="venueName" error={e.venueName}>
          <Input id="venueName" name="venueName" defaultValue={v.venueName} placeholder="Centro de capacitación…" required />
        </Field>
        <Field label="Dirección" htmlFor="address" error={e.address}>
          <Input id="address" name="address" defaultValue={v.address} required />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="País" htmlFor="country">
          <Select id="country" name="country" value={country} onChange={(ev) => setCountry(ev.target.value)}>
            {Object.entries(COUNTRIES).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Departamento" htmlFor="department">
          {country === "HN" ? (
            <Select id="department" name="department" defaultValue={v.department ?? ""} key="hn">
              <option value="">—</option>
              {HONDURAS_DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          ) : (
            <Input id="department" name="department" defaultValue={v.department ?? ""} key="other" />
          )}
        </Field>
        <Field label="Ciudad" htmlFor="city" error={e.city}>
          <Input id="city" name="city" defaultValue={v.city} required />
        </Field>
        <Field label="Enlace de mapa (opcional)" htmlFor="mapUrl" error={e.mapUrl}>
          <Input id="mapUrl" name="mapUrl" type="url" defaultValue={v.mapUrl ?? ""} placeholder="https://maps.google.com/…" />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Cupo" htmlFor="capacity" error={e.capacity} hint="Al aumentarlo se confirma la lista de espera.">
          <Input id="capacity" name="capacity" type="number" min={1} defaultValue={v.capacity ?? 30} required />
        </Field>
        <Field label="Categoría" htmlFor="categoryId">
          <Select id="categoryId" name="categoryId" defaultValue={v.categoryId ?? ""}>
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Estado" htmlFor="status">
          <Select id="status" name="status" defaultValue={v.status ?? "DRAFT"}>
            {Object.entries(STATUS_LABELS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Imagen de portada" htmlFor="cover" error={e.cover}>
          <Input id="cover" name="cover" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="py-1.5" />
        </Field>
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Marcas organizadoras</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-md border border-ink-200 bg-white p-3">
          {brands.map((b) => (
            <Checkbox key={b.id} name="sponsorIds" value={b.id} label={b.name} defaultChecked={event?.sponsorIds?.includes(b.id)} />
          ))}
        </div>
      </fieldset>
      <SubmitButton pendingText="Guardando…">{event?.id ? "Guardar cambios" : "Crear evento"}</SubmitButton>
    </form>
  );
}

export function CheckInForm({ eventId }: { eventId: string }) {
  const [state, action] = useActionState(checkInAction, initialState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="eventId" value={eventId} />
      <div className="flex gap-2">
        <Input
          name="ticketCode"
          placeholder="TKT-XXXX-XXXX-XXXX"
          aria-label="Código de entrada"
          className="font-mono uppercase"
          autoComplete="off"
          autoFocus
          required
        />
        <SubmitButton pendingText="…">Registrar ingreso</SubmitButton>
      </div>
      <FormFeedback state={state} />
    </form>
  );
}
