import "server-only";
import { createElement as h } from "react";
import { Document, Image, Page, StyleSheet, Svg, Path, Rect, Text, View, renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { formatDate } from "@/lib/format";

const s = StyleSheet.create({
  page: { padding: 0, fontFamily: "Helvetica", color: "#0f172a", backgroundColor: "#ffffff" },
  frame: { margin: 24, flex: 1, borderWidth: 2, borderColor: "#0f172a", padding: 36, position: "relative" },
  inner: { position: "absolute", top: 6, left: 6, right: 6, bottom: 6, borderWidth: 0.75, borderColor: "#ea580c" },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  brandAccent: { color: "#ea580c" },
  kicker: { marginTop: 36, fontSize: 12, letterSpacing: 3, color: "#64748b", textAlign: "center" },
  title: { marginTop: 6, fontSize: 34, fontFamily: "Helvetica-Bold", textAlign: "center" },
  label: { marginTop: 22, fontSize: 12, color: "#475569", textAlign: "center" },
  name: { marginTop: 8, fontSize: 28, fontFamily: "Helvetica-Bold", textAlign: "center", color: "#c2410c" },
  course: { marginTop: 8, fontSize: 18, fontFamily: "Helvetica-Bold", textAlign: "center", paddingHorizontal: 40 },
  meta: { marginTop: 10, fontSize: 11, color: "#475569", textAlign: "center" },
  footer: { position: "absolute", left: 36, right: 36, bottom: 32, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  sign: { width: 200, borderTopWidth: 1, borderTopColor: "#0f172a", paddingTop: 4, fontSize: 10, textAlign: "center" },
  verify: { alignItems: "center" },
  code: { marginTop: 4, fontSize: 9, fontFamily: "Courier-Bold" },
  small: { fontSize: 8, color: "#64748b" },
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
  const qr = await QRCode.toDataURL(d.verifyUrl, { margin: 0, width: 240, color: { dark: "#0f172a", light: "#ffffff" } });
  const doc = h(
    Document,
    { title: `Certificado – ${d.courseTitle}`, author: "Academia del Constructor" },
    h(
      Page,
      { size: "LETTER", orientation: "landscape", style: s.page },
      h(
        View,
        { style: s.frame },
        h(View, { style: s.inner }),
        h(
          View,
          { style: s.header },
          h(
            Svg,
            { width: 28, height: 28, viewBox: "0 0 32 32" },
            h(Rect, { width: 32, height: 32, rx: 6, fill: "#ea580c" }),
            h(Path, { d: "M6 24 L16 7 L26 24 Z", stroke: "#ffffff", strokeWidth: 2.5, fill: "none" }),
          ),
          h(Text, { style: s.brand }, "Academia ", h(Text, { style: s.brandAccent }, "del Constructor")),
        ),
        h(Text, { style: s.kicker }, "CERTIFICADO DE APROBACIÓN"),
        h(Text, { style: s.title }, "Certificado"),
        h(Text, { style: s.label }, "Se otorga el presente certificado a"),
        h(Text, { style: s.name }, d.holderName),
        h(Text, { style: s.label }, "por haber completado y aprobado el curso"),
        h(Text, { style: s.course }, d.courseTitle),
        h(
          Text,
          { style: s.meta },
          `Duración: ${d.hours} ${d.hours === 1 ? "hora" : "horas"} · Fecha de emisión: ${formatDate(d.issuedAt)}`,
        ),
        d.sponsors.length ? h(Text, { style: s.meta }, `Con el apoyo de ${d.sponsors.join(", ")}`) : null,
        h(
          View,
          { style: s.footer },
          h(Text, { style: s.sign }, "Coordinación Académica\nAcademia del Constructor"),
          h(
            View,
            { style: s.verify },
            h(Image, { src: qr, style: { width: 72, height: 72 } }),
            h(Text, { style: s.code }, d.code),
            h(Text, { style: s.small }, "Verifique en " + new URL(d.verifyUrl).host),
          ),
        ),
      ),
    ),
  );
  return renderToBuffer(doc);
}
