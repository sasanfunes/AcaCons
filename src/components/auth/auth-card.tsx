import type { ReactNode } from "react";
import { Card, Container } from "@/components/ui/misc";

export function AuthCard({ title, subtitle, children, wide }: { title: string; subtitle?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <Container className={`py-12 ${wide ? "max-w-2xl" : "max-w-md"}`}>
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </Card>
    </Container>
  );
}
