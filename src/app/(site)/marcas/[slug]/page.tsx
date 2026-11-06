import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ExternalLink, FileText } from "lucide-react";
import { getBrandBySlug } from "@/server/queries/brands";
import { formatBytes } from "@/lib/format";
import { fileUrl } from "@/lib/storage/url";
import { CourseCard } from "@/components/course/course-card";
import { EventCard } from "@/components/event/event-card";
import { Logo } from "@/components/ui/cover";
import { Container, EmptyState } from "@/components/ui/misc";

export async function generateMetadata({ params }: PageProps<"/marcas/[slug]">): Promise<Metadata> {
  const b = await getBrandBySlug((await params).slug);
  return b ? { title: b.name, description: b.description } : {};
}

export default async function BrandPage({ params }: PageProps<"/marcas/[slug]">) {
  const brand = await getBrandBySlug((await params).slug);
  if (!brand) notFound();
  return (
    <Container className="py-10">
      <nav aria-label="Ruta" className="mb-4 text-sm text-ink-600">
        <Link href="/marcas" className="hover:text-brand-700">
          ← Marcas
        </Link>
      </nav>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Logo fileKey={brand.logoKey} alt={brand.name} className="h-24 w-24 shrink-0" />
        <div>
          <h1 className="text-3xl font-bold">{brand.name}</h1>
          <p className="mt-2 max-w-3xl text-ink-600">{brand.description}</p>
          {brand.website && (
            <a href={brand.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
              Sitio web <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold">Fichas técnicas</h2>
        {brand.technicalSheets.length === 0 ? (
          <EmptyState title="Sin fichas técnicas publicadas" />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {brand.technicalSheets.map((s) => (
              <li key={s.id}>
                <a
                  href={fileUrl(s.fileKey, `${s.title}.pdf`)!}
                  className="group flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-4 hover:shadow"
                >
                  <FileText className="h-8 w-8 shrink-0 text-red-600" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium group-hover:text-brand-700">{s.title}</span>
                    <span className="block text-xs text-ink-500">
                      {[s.productName, s.category?.name, s.fileSize ? formatBytes(s.fileSize) : null].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <Download className="h-5 w-5 text-ink-400 group-hover:text-brand-700" aria-label="Descargar" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {brand.sponsoredCourses.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold">Cursos</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brand.sponsoredCourses.map((c) => (
              <CourseCard key={c.id} course={c} popover />
            ))}
          </div>
        </section>
      )}

      {brand.sponsoredEvents.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold">Próximos eventos</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {brand.sponsoredEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
