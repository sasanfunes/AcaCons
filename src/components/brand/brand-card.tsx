import Link from "next/link";
import { Logo } from "@/components/ui/cover";

type Brand = { slug: string; name: string; logoKey: string | null; description: string; _count: { sponsoredCourses: number; technicalSheets: number } };

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link href={`/marcas/${brand.slug}`} className="group flex gap-4 rounded-lg border border-ink-200 bg-white p-4 shadow-sm hover:shadow-md">
      <Logo fileKey={brand.logoKey} alt={brand.name} className="h-16 w-16 shrink-0" />
      <div className="min-w-0">
        <h3 className="font-semibold group-hover:text-brand-700">{brand.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-600">{brand.description}</p>
        <p className="mt-2 text-xs text-ink-500">
          {brand._count.sponsoredCourses} cursos · {brand._count.technicalSheets} fichas técnicas
        </p>
      </div>
    </Link>
  );
}
