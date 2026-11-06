import type { Metadata } from "next";
import { listBrands } from "@/server/queries/brands";
import { BrandCard } from "@/components/brand/brand-card";
import { Container, EmptyState, PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Marcas y fabricantes", description: "Fabricantes aliados y fichas técnicas de sus productos." };

export default async function MarcasPage() {
  const brands = await listBrands();
  return (
    <Container className="py-10">
      <PageHeader
        title="Marcas y fabricantes"
        description="Los fabricantes que hacen posible la formación gratuita. Consulte sus cursos, eventos y fichas técnicas."
      />
      {brands.length === 0 ? (
        <EmptyState title="Todavía no hay marcas publicadas" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <BrandCard key={b.id} brand={b} />
          ))}
        </div>
      )}
    </Container>
  );
}
