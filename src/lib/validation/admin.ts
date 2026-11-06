import { z } from "zod";
import { COUNTRIES, LEVELS, TIMEZONES } from "@/lib/constants";

const keys = <T extends Record<string, unknown>>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];
const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones")
  .max(80)
  .optional()
  .or(z.literal(""));
const status = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const ids = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]).filter(Boolean));
const url = z.union([z.literal(""), z.string().trim().url("URL inválida").max(500)]).transform((v) => v || null);

export const courseSchema = z.object({
  title: z.string().trim().min(3, "Mínimo 3 caracteres").max(160),
  slug,
  summary: z.string().trim().min(10, "Escriba un resumen (mínimo 10 caracteres)").max(300),
  description: z.string().max(20000).default(""),
  level: z.enum(keys(LEVELS)),
  estimatedMinutes: z.coerce.number().int().min(1, "Debe ser mayor a 0").max(10000),
  categoryId: z.string().min(1, "Seleccione una categoría"),
  instructorId: optional(50),
  status,
  featured: z.literal("on").optional().transform((v) => v === "on"),
  sponsorIds: ids,
  sheetIds: ids,
});

export const moduleSchema = z.object({ title: z.string().trim().min(2, "Ingrese un título").max(160) });

export const lessonSchema = z.object({
  title: z.string().trim().min(2, "Ingrese un título").max(160),
  videoUrl: z.string().trim().min(1, "Pegue la URL del video"),
  durationMinutes: z.coerce.number().int().min(0).max(600).default(0),
  content: z.string().max(20000).optional().transform((v) => v || null),
  isPreview: z.literal("on").optional().transform((v) => v === "on"),
});

export const quizSchema = z.object({
  title: z.string().trim().min(2, "Ingrese un título").max(160),
  passingScore: z.coerce.number().int().min(1).max(100),
  required: z.literal("on").optional().transform((v) => v === "on"),
  moduleId: optional(50),
});

export const questionSchema = z
  .object({
    prompt: z.string().trim().min(3, "Escriba la pregunta").max(500),
    explanation: optional(1000),
    options: z.array(z.string().trim().max(300)).transform((a) => a.filter(Boolean)),
    correct: z.coerce.number().int().min(0, "Marque la respuesta correcta"),
  })
  .refine((d) => d.options.length >= 2, { path: ["options"], message: "Ingrese al menos 2 opciones" })
  .refine((d) => d.correct < d.options.length, { path: ["correct"], message: "La respuesta correcta debe tener texto" });

export const eventSchema = z
  .object({
    title: z.string().trim().min(3).max(160),
    slug,
    summary: z.string().trim().min(10, "Escriba un resumen").max(300),
    description: z.string().max(20000).default(""),
    timezone: z.enum(keys(TIMEZONES)),
    startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Fecha inválida"),
    endsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Fecha inválida"),
    registrationClosesAt: z.string().optional().transform((v) => v || null),
    venueName: z.string().trim().min(2, "Ingrese el lugar").max(160),
    address: z.string().trim().min(2, "Ingrese la dirección").max(300),
    city: z.string().trim().min(2, "Ingrese la ciudad").max(80),
    department: optional(80),
    country: z.enum(keys(COUNTRIES)),
    mapUrl: url,
    capacity: z.coerce.number().int().min(1, "Mínimo 1").max(100000),
    categoryId: optional(50),
    status,
    sponsorIds: ids,
  })
  .refine((d) => d.endsAt > d.startsAt, { path: ["endsAt"], message: "Debe ser posterior al inicio" });

export const brandSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug,
  description: z.string().trim().min(10, "Escriba una descripción").max(2000),
  website: url,
  status,
});

export const sheetSchema = z.object({
  title: z.string().trim().min(2, "Ingrese un título").max(200),
  productName: optional(160),
  categoryId: optional(50),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug,
  description: optional(500),
  position: z.coerce.number().int().min(0).max(1000).default(0),
});

export const instructorSchema = z.object({
  name: z.string().trim().min(2).max(120),
  title: optional(200),
  bio: optional(2000),
});
