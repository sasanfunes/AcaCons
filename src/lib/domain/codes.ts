// Base32 de Crockford: sin I, L, O ni U para evitar confusiones al leer o dictar el código.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Genera un código legible tipo `CERT-7K3M-Q9XD-2HPA` usando aleatoriedad criptográfica. */
export function generateCode(prefix: string, groups = 3, groupSize = 4): string {
  const bytes = new Uint8Array(groups * groupSize);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b & 31]);
  const parts: string[] = [];
  for (let i = 0; i < groups; i++) parts.push(chars.slice(i * groupSize, (i + 1) * groupSize).join(""));
  return [prefix, ...parts].join("-");
}

/** Normaliza un código ingresado a mano (minúsculas, espacios, O→0, I/L→1). */
export function normalizeCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[O]/g, "0")
    .replace(/[IL]/g, "1")
    .replace(/^(CERT|TKT)(?!-)/, "$1-");
}
