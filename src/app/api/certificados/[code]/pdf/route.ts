import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { renderCertificatePdf } from "@/lib/pdf/certificate";
import { getCertificateByCode } from "@/server/queries/certificates";
import { slugify } from "@/lib/domain/slug";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: RouteContext<"/api/certificados/[code]/pdf">) {
  const { code } = await ctx.params;
  const cert = await getCertificateByCode(code);
  if (!cert) return new NextResponse("Certificado no encontrado", { status: 404 });
  const pdf = await renderCertificatePdf({
    code: cert.code,
    holderName: cert.holderName,
    courseTitle: cert.courseTitle,
    hours: cert.hours,
    issuedAt: cert.issuedAt,
    sponsors: cert.course.sponsors.map((s) => s.name),
    verifyUrl: `${env.APP_URL}/certificados/${cert.code}`,
  });
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificado-${slugify(cert.courseTitle)}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
