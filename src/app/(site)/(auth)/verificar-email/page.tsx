import type { Metadata } from "next";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { ResendVerificationForm } from "@/components/auth/simple-forms";

export const metadata: Metadata = { title: "Verifique su correo" };

export default async function VerificarEmailPage({ searchParams }: PageProps<"/verificar-email">) {
  const { email } = await searchParams;
  return (
    <AuthCard title="Revise su correo">
      <div className="mb-6 flex gap-3 text-sm text-ink-700">
        <MailCheck className="h-6 w-6 shrink-0 text-brand-600" aria-hidden />
        <p>
          Le enviamos un enlace de confirmación{typeof email === "string" ? <> a <strong>{email}</strong></> : null}. Ábralo para
          activar su cuenta. Si no lo encuentra, revise la carpeta de correo no deseado.
        </p>
      </div>
      <ResendVerificationForm email={typeof email === "string" ? email : undefined} />
    </AuthCard>
  );
}
