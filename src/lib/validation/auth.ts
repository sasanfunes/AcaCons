import { z } from "zod";
import { COUNTRIES, PROFESSIONS } from "@/lib/constants";

const professionKeys = Object.keys(PROFESSIONS) as [keyof typeof PROFESSIONS, ...(keyof typeof PROFESSIONS)[]];
const countryKeys = Object.keys(COUNTRIES) as [keyof typeof COUNTRIES, ...(keyof typeof COUNTRIES)[]];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((v) => (v ? v : undefined));

export const email = z.string().trim().toLowerCase().email("Ingrese un correo válido");
export const password = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña es demasiado larga");

export const profileFields = {
  name: z.string().trim().min(2, "Ingrese su nombre completo").max(120),
  profession: z.enum(professionKeys, { message: "Seleccione su profesión u oficio" }),
  company: optionalText(120),
  country: z.enum(countryKeys, { message: "Seleccione un país" }),
  department: optionalText(80),
  city: optionalText(80),
  phone: optionalText(30),
};

export const signUpSchema = z
  .object({
    ...profileFields,
    email,
    password,
    confirmPassword: z.string(),
    terms: z.literal("on", { message: "Debe aceptar los términos y la política de privacidad" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export const signInSchema = z.object({ email, password: z.string().min(1, "Ingrese su contraseña") });

export const profileSchema = z.object(profileFields);

export const resetSchema = z
  .object({ token: z.string().min(1), password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Las contraseñas no coinciden" });

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, "Ingrese su contraseña actual"), password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Las contraseñas no coinciden" });

/** Solo permite redirecciones internas. */
export function safeRedirect(target: unknown, fallback = "/mi-cuenta"): string {
  if (typeof target !== "string" || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return fallback;
  }
  return target;
}
