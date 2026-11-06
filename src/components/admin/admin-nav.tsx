"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Building2, CalendarDays, GraduationCap, LayoutDashboard, Tags, Users } from "lucide-react";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/admin/marcas", label: "Marcas", icon: Building2 },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/instructores", label: "Instructores", icon: GraduationCap },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Administración" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium",
              active ? "bg-brand-500 text-ink-900" : "text-ink-300 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
