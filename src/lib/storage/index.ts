import "server-only";
import { env } from "@/lib/env";
import { createDriver, type StorageDriver } from "./drivers";

export { assertSafeKey, type StorageDriver } from "./drivers";

export const storage: StorageDriver = createDriver(env);

export { fileUrl } from "./url";

export const UPLOAD_RULES = {
  image: { maxBytes: 5 * 1024 * 1024, types: { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg" } },
  pdf: { maxBytes: 20 * 1024 * 1024, types: { "application/pdf": "pdf" } },
} as const;

export const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

export type UploadKind = keyof typeof UPLOAD_RULES;

/** Valida y guarda un archivo subido desde un formulario. Devuelve la clave o un error legible. */
export async function saveUpload(
  file: File,
  kind: UploadKind,
  prefix: string,
): Promise<{ key: string; size: number } | { error: string }> {
  const rules = UPLOAD_RULES[kind];
  const ext = (rules.types as Record<string, string>)[file.type];
  if (!ext) return { error: kind === "pdf" ? "El archivo debe ser PDF." : "La imagen debe ser PNG, JPG, WEBP o SVG." };
  if (file.size > rules.maxBytes) return { error: `El archivo supera el máximo de ${rules.maxBytes / 1024 / 1024} MB.` };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (kind === "pdf" && new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") return { error: "El archivo no es un PDF válido." };
  const key = `${prefix}/${crypto.randomUUID()}.${ext}`;
  await storage.put(key, bytes, file.type);
  return { key, size: file.size };
}
