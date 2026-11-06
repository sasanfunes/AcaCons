import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Download, XCircle } from "lucide-react";
import { getCertificateByCode } from "@/server/queries/certificates";
import { getOptionalUser } from "@/server/guards";
import { formatDate } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { Card, Container } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Certificado", robots: { index: false } };

export default async function CertificatePage({ params }: PageProps<"/certificados/[code]">) {
  const { code } = await params;
  const [cert, user] = await Promise.all([getCertificateByCode(decodeURIComponent(code)), getOptionalUser()]);

  if (!cert) {
    return (
      <Container className="max-w-xl py-16">
        <Card className="p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-600" aria-hidden />
          <h1 className="mt-3 text-xl font-bold">Certificado no encontrado</h1>
          <p className="mt-2 text-ink-600">
            No existe un certificado con el código <span className="font-mono">{decodeURIComponent(code)}</span>. Revise que lo haya
            escrito correctamente.
          </p>
          <ButtonLink href="/certificados/verificar" variant="outline" className="mt-6">
            Verificar otro código
          </ButtonLink>
        </Card>
      </Container>
    );
  }

  const isOwner = user?.id === cert.userId;
  return (
    <Container className="max-w-2xl py-16">
      <Card className="p-8">
        <div className="flex items-center gap-3 text-green-700">
          <BadgeCheck className="h-10 w-10" aria-hidden />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider">Certificado válido</p>
            <p className="font-mono text-sm text-ink-600">{cert.code}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm text-ink-500">Otorgado a</dt>
            <dd className="text-2xl font-bold">{cert.holderName}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-ink-500">Curso aprobado</dt>
            <dd className="text-lg font-semibold">
              {cert.course.status === "PUBLISHED" ? (
                <Link href={`/cursos/${cert.course.slug}`} className="hover:text-brand-700">
                  {cert.courseTitle}
                </Link>
              ) : (
                cert.courseTitle
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-500">Fecha de emisión</dt>
            <dd className="font-medium">{formatDate(cert.issuedAt)}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-500">Duración</dt>
            <dd className="font-medium">{cert.hours} horas</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`/api/certificados/${cert.code}/pdf`} className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700" target="_blank" rel="noopener">
            <Download className="h-4 w-4" aria-hidden /> {isOwner ? "Descargar mi certificado (PDF)" : "Ver certificado (PDF)"}
          </a>
          {isOwner && (
            <ButtonLink href="/mi-cuenta" variant="outline">
              Mis cursos
            </ButtonLink>
          )}
        </div>
      </Card>
    </Container>
  );
}
