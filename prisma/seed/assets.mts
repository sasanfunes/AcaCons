import { createElement as h } from "react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function wrap(text: string, max = 26): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      lines.push(line.trim());
      line = w;
    } else line += " " + w;
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 3);
}

const POPPINS_700 = readFileSync(
  fileURLToPath(new URL("../../node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2", import.meta.url)),
).toString("base64");

/** Portada SVG 16:9 según el manual: fondo carbón, franja amarilla, etiqueta amarilla con texto carbón y título blanco en Poppins. */
export function coverSvg(title: string, _color: string, label: string): string {
  const lines = wrap(title, 24);
  const tag = label.toUpperCase();
  const tagWidth = Math.min(1100, 72 + tag.length * 27);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
<defs><style>@font-face{font-family:"Poppins";font-weight:700;src:url(data:font/woff2;base64,${POPPINS_700}) format("woff2")}text{font-family:Poppins,Arial,sans-serif;font-weight:700}</style></defs>
<rect width="1280" height="720" fill="#2C2C2A"/>
<rect width="28" height="720" fill="#FFC20E"/>
<rect x="96" y="90" width="${tagWidth}" height="76" fill="#FFC20E"/>
<text x="128" y="141" font-size="36" letter-spacing="3" fill="#2C2C2A">${esc(tag)}</text>
${lines.map((l, i) => `<text x="96" y="${290 + i * 84}" font-size="68" fill="#FFFFFF">${esc(l)}</text>`).join("")}
<text x="96" y="640" font-size="34" fill="#FFC20E">La Academia del Constructor</text>
</svg>`;
}

/** Logo SVG simple con iniciales. */
export function logoSvg(name: string, color: string): string {
  const initials = name
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
<rect width="240" height="240" rx="32" fill="${color}"/>
<text x="120" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="96" font-weight="bold" fill="#fff">${esc(initials)}</text>
</svg>`;
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#0f172a" },
  header: { borderBottomWidth: 3, borderBottomColor: "#ea580c", paddingBottom: 10, marginBottom: 20 },
  brand: { fontSize: 12, color: "#ea580c", fontFamily: "Helvetica-Bold" },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", marginTop: 4 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 16, marginBottom: 6 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingVertical: 4 },
  cellL: { width: "45%", color: "#475569" },
  cellR: { width: "55%" },
  note: { marginTop: 24, fontSize: 9, color: "#64748b" },
});

/** Ficha técnica de ejemplo en PDF. */
export async function technicalSheetPdf(brand: string, title: string, product: string): Promise<Uint8Array> {
  const props: [string, string][] = [
    ["Producto", product],
    ["Presentación", "Según catálogo vigente"],
    ["Rendimiento", "Ver tabla de aplicación"],
    ["Almacenamiento", "Lugar seco y ventilado, sobre tarimas"],
    ["Vida útil en almacén", "12 meses en empaque original"],
  ];
  const doc = h(
    Document,
    { title: `${title} – ${brand}` },
    h(
      Page,
      { size: "LETTER", style: styles.page },
      h(View, { style: styles.header }, h(Text, { style: styles.brand }, brand), h(Text, { style: styles.title }, `Ficha técnica: ${title}`)),
      h(Text, { style: styles.h2 }, "Descripción"),
      h(
        Text,
        null,
        `${product} es un producto para obra diseñado para las condiciones de clima tropical de Centroamérica. Siga siempre las recomendaciones de preparación, aplicación y curado indicadas en esta ficha.`,
      ),
      h(Text, { style: styles.h2 }, "Datos técnicos"),
      ...props.map(([k, v]) => h(View, { style: styles.row, key: k }, h(Text, { style: styles.cellL }, k), h(Text, { style: styles.cellR }, v))),
      h(Text, { style: styles.h2 }, "Recomendaciones de uso"),
      h(Text, null, "• Verifique que la superficie esté limpia y libre de polvo, grasa o partes sueltas."),
      h(Text, null, "• Respete las proporciones y tiempos indicados por el fabricante."),
      h(Text, null, "• Utilice equipo de protección personal durante la manipulación."),
      h(Text, { style: styles.note }, "Documento de ejemplo generado para la Academia del Constructor. Los datos son ilustrativos."),
    ),
  );
  return new Uint8Array(await renderToBuffer(doc));
}
