"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "@/server/actions/auth";
import { initialState } from "@/lib/validation/action";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";

export function SignInForm({ volver }: { volver?: string }) {
  const [state, action] = useActionState(signInAction, initialState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {volver && <input type="hidden" name="volver" value={volver} />}
      <Field label="Correo electrónico" htmlFor="email" error={e.email}>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} required />
      </Field>
      <Field label="Contraseña" htmlFor="password" error={e.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <div className="flex items-center justify-between">
        <Checkbox name="remember" label="Recordarme" defaultChecked />
        <Link href="/recuperar" className="text-sm text-brand-700 hover:underline">
          ¿Olvidó su contraseña?
        </Link>
      </div>
      <SubmitButton className="w-full" pendingText="Ingresando…">
        Ingresar
      </SubmitButton>
      <p className="text-center text-sm text-ink-600">
        ¿No tiene cuenta?{" "}
        <Link href={volver ? `/registro?volver=${encodeURIComponent(volver)}` : "/registro"} className="font-medium text-brand-700 hover:underline">
          Regístrese gratis
        </Link>
      </p>
    </form>
  );
}
