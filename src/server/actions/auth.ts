"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { requireUser } from "@/server/guards";
import { type ActionState, stringValues, validationError } from "@/lib/validation/action";
import {
  changePasswordSchema,
  email as emailSchema,
  profileSchema,
  resetSchema,
  safeRedirect,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth";

const AUTH_ERRORS: Record<string, string> = {
  USER_ALREADY_EXISTS: "Ya existe una cuenta con ese correo.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Ya existe una cuenta con ese correo.",
  INVALID_EMAIL_OR_PASSWORD: "Correo o contraseña incorrectos.",
  EMAIL_NOT_VERIFIED: "Debe confirmar su correo antes de ingresar. Le reenviamos el enlace de verificación.",
  INVALID_TOKEN: "El enlace no es válido o ya venció. Solicite uno nuevo.",
  INVALID_PASSWORD: "La contraseña actual no es correcta.",
  PASSWORD_TOO_SHORT: "La contraseña es demasiado corta.",
};

function authErrorMessage(e: unknown): string {
  if (e instanceof APIError) {
    const code = (e.body as { code?: string } | undefined)?.code;
    if (code && AUTH_ERRORS[code]) return AUTH_ERRORS[code];
    if (e.status === "TOO_MANY_REQUESTS") return "Demasiados intentos. Espere unos minutos e intente de nuevo.";
  }
  console.error(e);
  return "Ocurrió un error inesperado. Intente nuevamente.";
}

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error, formData);
  const { confirmPassword: _c, terms: _t, ...data } = parsed.data;
  const next = safeRedirect(formData.get("volver"));
  try {
    await auth.api.signUpEmail({
      body: { ...data, callbackURL: `${next}${next.includes("?") ? "&" : "?"}verificado=1` },
      headers: await headers(),
    });
  } catch (e) {
    return { error: authErrorMessage(e), values: stringValues(formData) };
  }
  if (env.REQUIRE_EMAIL_VERIFICATION) redirect(`/verificar-email?email=${encodeURIComponent(data.email)}`);
  redirect(next);
}

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error, formData);
  try {
    await auth.api.signInEmail({
      body: { ...parsed.data, rememberMe: formData.get("remember") === "on", callbackURL: "/mi-cuenta?verificado=1" },
      headers: await headers(),
    });
  } catch (e) {
    return { error: authErrorMessage(e), values: stringValues(formData) };
  }
  redirect(safeRedirect(formData.get("volver")));
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

export async function requestPasswordResetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { fieldErrors: { email: ["Ingrese un correo válido"] } };
  try {
    await auth.api.requestPasswordReset({ body: { email: parsed.data, redirectTo: `${env.APP_URL}/restablecer` } });
  } catch (e) {
    console.error(e);
  }
  // Siempre el mismo mensaje para no revelar si el correo existe.
  return { ok: true, message: "Si el correo está registrado, recibirá un enlace para crear una nueva contraseña." };
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);
  try {
    await auth.api.resetPassword({ body: { token: parsed.data.token, newPassword: parsed.data.password } });
  } catch (e) {
    return { error: authErrorMessage(e) };
  }
  redirect("/ingresar?restablecida=1");
}

export async function resendVerificationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { error: "Ingrese un correo válido" };
  try {
    await auth.api.sendVerificationEmail({ body: { email: parsed.data, callbackURL: "/mi-cuenta?verificado=1" } });
  } catch (e) {
    console.error(e);
  }
  return { ok: true, message: "Si la cuenta existe y no está verificada, le enviamos un nuevo enlace." };
}

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error, formData);
  const d = parsed.data;
  await db.user.update({
    where: { id: user.id },
    data: {
      name: d.name,
      profession: d.profession,
      company: d.company ?? null,
      country: d.country,
      department: d.department ?? null,
      city: d.city ?? null,
      phone: d.phone ?? null,
    },
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Perfil actualizado." };
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);
  try {
    await auth.api.changePassword({
      body: { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.password, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch (e) {
    return { error: authErrorMessage(e) };
  }
  return { ok: true, message: "Contraseña actualizada." };
}
