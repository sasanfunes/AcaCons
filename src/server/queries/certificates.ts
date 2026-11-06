import "server-only";
import { db } from "@/lib/db";
import { normalizeCode } from "@/lib/domain/codes";

export function getCertificateByCode(code: string) {
  return db.certificate.findUnique({
    where: { code: normalizeCode(code) },
    include: { course: { select: { slug: true, status: true, sponsors: { select: { name: true } } } } },
  });
}

export function listUserCertificates(userId: string) {
  return db.certificate.findMany({ where: { userId }, orderBy: { issuedAt: "desc" }, include: { course: { select: { slug: true, coverKey: true } } } });
}
