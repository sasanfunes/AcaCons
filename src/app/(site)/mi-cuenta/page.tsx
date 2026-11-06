import type { Metadata } from "next";
import Link from "next/link";
import { Award, Download } from "lucide-react";
import { requireUser } from "@/server/guards";
import { getMyCourses } from "@/server/queries/account";
import { listUserCertificates } from "@/server/queries/certificates";
import { formatDate } from "@/lib/format";
import { CourseCard } from "@/components/course/course-card";
import { ButtonLink } from "@/components/ui/button";
import { Alert, Card, EmptyState } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Mi aprendizaje" };

export default async function MiCuentaPage({ searchParams }: PageProps<"/mi-cuenta">) {
  const user = await requireUser();
  const { verificado } = await searchParams;
  const [courses, certificates] = await Promise.all([getMyCourses(user.id), listUserCertificates(user.id)]);
  const inProgress = courses.filter((c) => !c.completedAt);
  const completed = courses.filter((c) => c.completedAt);

  return (
    <div className="space-y-10">
      {verificado && user.emailVerified && <Alert tone="success">¡Su correo fue verificado! Bienvenido a La Academia del Constructor.</Alert>}
      {!user.emailVerified && (
        <Alert>
          Aún no confirmó su correo electrónico. <Link href={`/verificar-email?email=${encodeURIComponent(user.email)}`} className="font-medium underline">Reenviar enlace</Link>
        </Alert>
      )}
      <section>
        <h2 className="mb-4 text-xl font-bold">Cursos en progreso</h2>
        {inProgress.length === 0 ? (
          <EmptyState title="No tiene cursos en progreso" action={<ButtonLink href="/cursos">Explorar cursos</ButtonLink>}>
            Inscríbase gratis en cualquier curso del catálogo.
          </EmptyState>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((e) => (
              <CourseCard key={e.id} course={e.course} progress={e.progress} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Mis certificados</h2>
        {certificates.length === 0 ? (
          <EmptyState title="Todavía no tiene certificados">Complete un curso y apruebe la evaluación final para obtenerlo.</EmptyState>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {certificates.map((c) => (
              <li key={c.id}>
                <Card className="flex items-center gap-4 p-4">
                  <Award className="h-10 w-10 shrink-0 text-brand-600" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <Link href={`/certificados/${c.code}`} className="font-semibold hover:text-brand-700">
                      {c.courseTitle}
                    </Link>
                    <p className="text-xs text-ink-500">
                      {formatDate(c.issuedAt)} · <span className="font-mono">{c.code}</span>
                    </p>
                  </div>
                  <a href={`/api/certificados/${c.code}/pdf`} target="_blank" rel="noopener" className="rounded-md p-2 hover:bg-ink-100" aria-label={`Descargar certificado de ${c.courseTitle}`}>
                    <Download className="h-5 w-5" aria-hidden />
                  </a>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Cursos completados</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((e) => (
              <CourseCard key={e.id} course={e.course} progress={100} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
