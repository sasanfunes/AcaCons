"use client";
import { useActionState } from "react";
import { changePasswordAction, updateProfileAction } from "@/server/actions/auth";
import { initialState } from "@/lib/validation/action";
import { PROFESSIONS } from "@/lib/constants";
import { Field, Input, Select } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";
import { LocationFields } from "@/components/auth/location-fields";

type Profile = {
  name: string;
  email: string;
  profession: string | null;
  company: string | null;
  country: string;
  department: string | null;
  city: string | null;
  phone: string | null;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(updateProfileAction, initialState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" htmlFor="name" error={e.name}>
          <Input id="name" name="name" defaultValue={profile.name} required />
        </Field>
        <Field label="Correo electrónico" htmlFor="email" hint="El correo no se puede cambiar.">
          <Input id="email" value={profile.email} disabled readOnly />
        </Field>
        <Field label="Profesión u oficio" htmlFor="profession" error={e.profession}>
          <Select id="profession" name="profession" defaultValue={profile.profession ?? ""} required>
            <option value="" disabled>
              Seleccione…
            </option>
            {Object.entries(PROFESSIONS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Empresa" htmlFor="company" error={e.company}>
          <Input id="company" name="company" defaultValue={profile.company ?? ""} />
        </Field>
        <Field label="Teléfono" htmlFor="phone" error={e.phone}>
          <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} />
        </Field>
      </div>
      <LocationFields defaults={profile} errors={e} />
      <SubmitButton pendingText="Guardando…">Guardar cambios</SubmitButton>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initialState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Field label="Contraseña actual" htmlFor="currentPassword" error={e.currentPassword}>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nueva contraseña" htmlFor="password" error={e.password}>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
        </Field>
        <Field label="Repetir nueva contraseña" htmlFor="confirmPassword" error={e.confirmPassword}>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
        </Field>
      </div>
      <SubmitButton variant="secondary" pendingText="Actualizando…">
        Cambiar contraseña
      </SubmitButton>
    </form>
  );
}
