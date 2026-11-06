/** Genera CSV con BOM UTF-8 (para que Excel muestre bien tildes y ñ). Neutraliza fórmulas. */
export function toCsv(rows: (string | number)[][]): string {
  const cell = (v: string | number) => {
    let s = String(v);
    // Solo se neutralizan valores que podrían interpretarse como fórmula (los teléfonos +504… se respetan).
    if (/^[=@\t\r]/.test(s) || /^[+-](?![\d\s()-]+$)/.test(s)) s = `'${s}`;
    return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
