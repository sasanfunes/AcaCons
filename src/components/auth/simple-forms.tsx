"use client";
import { useActionState } from "react";
import { requestPasswordResetAction, resendVerificationAction, resetPasswordAction } from "@/server/actions/auth";
import { initialState } from "@/lib/validation/action";
import { Field, Input } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";

export function RequestResetForm() {
  const [state, action] = useActionState(requestPasswordResetAction, initialState);
  if (state.ok) return <Alert tone="success">{state.message}</Alert>;
  return (
    <form action={action} className="space-y-4">
      <Field label="Correo electrónico" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <SubmitButton className="w-full">Enviar enlace</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initialState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <input type="hidden" name="token" value={token} />
      <Field label="Nueva contraseña" htmlFor="password" error={e.password} hint="Mínimo 8 caracteres">
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Repetir contraseña" htmlFor="confirmPassword" error={e.confirmPassword}>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
      </Field>
      <SubmitButton className="w-full">Guardar contraseña</SubmitButton>
    </form>
  );
}

export function ResendVerificationForm({ email }: { email?: string }) {
  const [state, action] = useActionState(resendVerificationAction, initialState);
  return (
    <form action={action} className="space-y-3">
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Field label="Correo electrónico" htmlFor="email">
        <Input id="email" name="email" type="email" defaultValue={email} required />
      </Field>
      <SubmitButton variant="outline" className="w-full">
        Reenviar enlace de verificación
      </SubmitButton>
    </form>
  );
}
