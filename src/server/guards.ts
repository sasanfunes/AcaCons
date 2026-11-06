import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
};

/** Usuario de la sesión actual (o null). Se memoiza por request. */
export const getOptionalUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  // El rol se lee siempre de la base para que un cambio de rol aplique de inmediato.
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, emailVerified: true },
  });
  return user;
});

export async function requireUser(redirectTo?: string): Promise<CurrentUser> {
  const user = await getOptionalUser();
  if (!user) {
    redirect(redirectTo ? `/ingresar?volver=${encodeURIComponent(redirectTo)}` : "/ingresar");
  }
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") forbidden();
  return user;
}
