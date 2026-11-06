"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signUpAction } from "@/server/actions/auth";
import { initialState } from "@/lib/validation/action";
import { PROFESSIONS } from "@/lib/constants";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";
import { LocationFields } from "./location-fields";

export function SignUpForm({ volver }: { volver?: string }) {
  const [state, action] = useActionState(signUpAction, initialState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {volver && <input type="hidden" name="volver" value={volver} />}
      <Field label="Nombre completo" htmlFor="name" error={e.name}>
        <Input id="name" name="name" autoComplete="name" defaultValue={v.name} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Correo electrónico" htmlFor="email" error={e.email}>
          <Input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} required />
        </Field>
        <Field label="Teléfono (opcional)" htmlFor="phone" error={e.phone}>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} placeholder="+504 9999-9999" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Profesión u oficio" htmlFor="profession" error={e.profession}>
          <Select id="profession" name="profession" defaultValue={v.profession ?? ""} required>
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
        <Field label="Empresa (opcional)" htmlFor="company" error={e.company}>
          <Input id="company" name="company" autoComplete="organization" defaultValue={v.company} />
        </Field>
      </div>
      <LocationFields defaults={{ country: v.country, department: v.department, city: v.city }} errors={e} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Contraseña" htmlFor="password" error={e.password} hint="Mínimo 8 caracteres">
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        </Field>
        <Field label="Repetir contraseña" htmlFor="confirmPassword" error={e.confirmPassword}>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
        </Field>
      </div>
      <div>
        <Checkbox name="terms" label={<>Acepto los términos de uso y la política de privacidad.</>} defaultChecked={v.terms === "on"} />
        {e.terms && <p className="mt-1 text-xs text-red-600">{e.terms[0]}</p>}
      </div>
      <SubmitButton className="w-full" pendingText="Creando cuenta…">
        Crear cuenta
      </SubmitButton>
      <p className="text-center text-sm text-ink-600">
        ¿Ya tiene cuenta?{" "}
        <Link href={volver ? `/ingresar?volver=${encodeURIComponent(volver)}` : "/ingresar"} className="font-medium text-brand-700 hover:underline">
          Ingresar
        </Link>
      </p>
    </form>
  );
}
