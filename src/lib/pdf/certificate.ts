import "server-only";
import path from "node:path";
import { createElement as h } from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { formatDate } from "@/lib/format";

// Identidad (manual de marca): Poppins, carbón, amarillo como franja y concreto oscuro para texto pequeño.
const NAVY = "#2C2C2A"; // carbón
const ORANGE = "#FFC20E"; // amarillo maquinaria
const ORANGE_DEEP = "#5E5C57"; // concreto oscuro
const SLATE = "#5E5C57";

const fontDir = path.join(process.cwd(), "src/lib/pdf/fonts");
Font.register({
  family: "Poppins",
  fonts: [
    { src: path.join(fontDir, "poppins-latin-400-normal.woff"), fontWeight: 400 },
    { src: path.join(fontDir, "poppins-latin-500-normal.woff"), fontWeight: 500 },
    { src: path.join(fontDir, "poppins-latin-600-normal.woff"), fontWeight: 600 },
    { src: path.join(fontDir, "poppins-latin-700-normal.woff"), fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback((word) => [word]);
const LOGO = path.join(process.cwd(), "public/brand/logo.png");

const s = StyleSheet.create({
  page: { fontFamily: "Poppins", color: NAVY, backgroundColor: "#FFFFFF", padding: 0 },
  stripe: { position: "absolute", left: 0, top: 0, bottom: 0, width: 14, backgroundColor: ORANGE },
  body: { flex: 1, paddingTop: 44, paddingBottom: 40, paddingLeft: 70, paddingRight: 56 },
  logo: { width: 200, height: 39 },
  kicker: { marginTop: 54, fontSize: 12, fontWeight: 600, letterSpacing: 2.5, color: ORANGE_DEEP },
  label: { marginTop: 18, fontSize: 12, color: SLATE },
  name: { marginTop: 4, fontSize: 32, fontWeight: 700, color: NAVY },
  course: { marginTop: 4, fontSize: 18, fontWeight: 600, color: NAVY, maxWidth: 560 },
  meta: { marginTop: 10, fontSize: 11, color: SLATE },
  footer: { position: "absolute", left: 70, right: 56, bottom: 40, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  signs: { flexDirection: "row", gap: 36 },
  sign: { width: 170, borderTopWidth: 1.5, borderTopColor: NAVY, paddingTop: 5, fontSize: 10, color: NAVY },
  signSub: { fontSize: 8, color: SLATE },
  verify: { alignItems: "center" },
  code: { marginTop: 4, fontSize: 9, fontWeight: 600, letterSpacing: 0.5 },
  small: { fontSize: 7.5, color: SLATE },
});

export type CertificateData = {
  code: string;
  holderName: string;
  courseTitle: string;
  hours: number;
  issuedAt: Date;
  sponsors: string[];
  verifyUrl: string;
};

export async function renderCertificatePdf(d: CertificateData): Promise<Buffer> {
  const qr = await QRCode.toDataURL(d.verifyUrl, { margin: 0, width: 240, color: { dark: NAVY, light: "#ffffff" } });
  const doc = h(
    Document,
    { title: `Certificado – ${d.courseTitle}`, author: "La Academia del Constructor" },
    h(
      Page,
      { size: "LETTER", orientation: "landscape", style: s.page },
      h(View, { style: s.stripe }),
      h(
        View,
        { style: s.body },
        h(Image, { src: LOGO, style: s.logo }),
        h(Text, { style: s.kicker }, "CERTIFICADO DE APROBACIÓN"),
        h(Text, { style: s.label }, "Se otorga a"),
        h(Text, { style: s.name }, d.holderName),
        h(Text, { style: s.label }, "por haber completado y aprobado el curso"),
        h(Text, { style: s.course }, d.courseTitle),
        h(
          Text,
          { style: s.meta },
          `${d.hours} ${d.hours === 1 ? "hora" : "horas"} · ${formatDate(d.issuedAt)}${
            d.sponsors.length ? ` · Con el apoyo de ${d.sponsors.join(", ")}` : ""
          }`,
        ),
      ),
      h(
        View,
        { style: s.footer },
        h(
          View,
          { style: s.signs },
          h(View, { style: s.sign }, h(Text, null, "Construnova"), h(Text, { style: s.signSub }, "Un programa de Construnova")),
          h(View, { style: s.sign }, h(Text, null, "Coordinación académica"), h(Text, { style: s.signSub }, "La Academia del Constructor")),
        ),
        h(
          View,
          { style: s.verify },
          h(Image, { src: qr, style: { width: 70, height: 70 } }),
          h(Text, { style: s.code }, d.code),
          h(Text, { style: s.small }, "Verifique en " + new URL(d.verifyUrl).host + "/certificados"),
        ),
      ),
    ),
  );
  return renderToBuffer(doc);
}
