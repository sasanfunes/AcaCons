import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/simple-forms";
import { Alert } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function RestablecerPage({ searchParams }: PageProps<"/restablecer">) {
  const { token, error } = await searchParams;
  return (
    <AuthCard title="Crear nueva contraseña">
      {typeof token === "string" && !error ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Alert tone="danger">
          El enlace no es válido o ya venció.{" "}
          <Link href="/recuperar" className="font-medium underline">
            Solicite uno nuevo
          </Link>
          .
        </Alert>
      )}
    </AuthCard>
  );
}
