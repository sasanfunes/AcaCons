"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/mi-cuenta", label: "Mi aprendizaje" },
  { href: "/mi-cuenta/eventos", label: "Mis eventos" },
  { href: "/mi-cuenta/perfil", label: "Mi perfil" },
];

export function AccountNav() {
  const path = usePathname();
  return (
    <nav aria-label="Mi cuenta" className="mb-8 flex gap-1 overflow-x-auto border-b border-ink-200">
      {TABS.map((t) => {
        const active = t.href === "/mi-cuenta" ? path === t.href : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium",
              active ? "border-brand-600 text-brand-700" : "border-transparent text-ink-600 hover:text-ink-900",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
