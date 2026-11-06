import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RequestResetForm } from "@/components/auth/simple-forms";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecuperarPage() {
  return (
    <AuthCard title="Recuperar contraseña" subtitle="Le enviaremos un enlace para crear una nueva contraseña.">
      <RequestResetForm />
    </AuthCard>
  );
}
