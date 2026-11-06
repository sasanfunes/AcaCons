import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getOptionalUser } from "@/server/guards";
import { safeRedirect } from "@/lib/validation/auth";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegistroPage({ searchParams }: PageProps<"/registro">) {
  const { volver } = await searchParams;
  const next = typeof volver === "string" ? safeRedirect(volver) : undefined;
  if (await getOptionalUser()) redirect(next ?? "/mi-cuenta");
  return (
    <AuthCard wide title="Cree su cuenta gratuita" subtitle="Acceda a cursos, certificados y eventos presenciales sobre materiales de construcción.">
      <SignUpForm volver={next} />
    </AuthCard>
  );
}
