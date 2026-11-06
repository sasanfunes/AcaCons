import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Alert } from "@/components/ui/misc";
import { getOptionalUser } from "@/server/guards";
import { safeRedirect } from "@/lib/validation/auth";

export const metadata: Metadata = { title: "Ingresar" };

export default async function IngresarPage({ searchParams }: PageProps<"/ingresar">) {
  const { volver, restablecida } = await searchParams;
  const next = typeof volver === "string" ? safeRedirect(volver) : undefined;
  if (await getOptionalUser()) redirect(next ?? "/mi-cuenta");
  return (
    <AuthCard title="Ingresar" subtitle="Bienvenido de nuevo a La Academia del Constructor.">
      {restablecida && (
        <Alert tone="success" className="mb-4">
          Su contraseña fue actualizada. Ya puede ingresar.
        </Alert>
      )}
      <SignInForm volver={next} />
    </AuthCard>
  );
}
