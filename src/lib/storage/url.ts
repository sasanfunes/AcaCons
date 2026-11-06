/** URL pública (servida por /api/files) de un archivo guardado. Usable en server y client. */
export function fileUrl(key: string | null | undefined, downloadName?: string): string | null {
  if (!key) return null;
  return downloadName ? `/api/files/${key}?nombre=${encodeURIComponent(downloadName)}` : `/api/files/${key}`;
}
