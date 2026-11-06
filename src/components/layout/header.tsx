import Link from "next/link";
import { Menu, ShieldCheck, UserRound } from "lucide-react";
import { getOptionalUser } from "@/server/guards";
import { signOutAction } from "@/server/actions/auth";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/misc";
import { Logo } from "./logo";

const NAV = [
  { href: "/cursos", label: "Cursos" },
  { href: "/eventos", label: "Eventos" },
  { href: "/marcas", label: "Marcas" },
  { href: "/certificados/verificar", label: "Verificar certificado" },
];

export async function Header() {
  const user = await getOptionalUser();
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-ink-900">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <UserMenu name={user.name} isAdmin={user.role === "ADMIN"} />
          ) : (
            <>
              <ButtonLink href="/ingresar" variant="ghost">
                Ingresar
              </ButtonLink>
              <ButtonLink href="/registro">Crear cuenta</ButtonLink>
            </>
          )}
        </div>
        <details className="relative md:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md hover:bg-ink-100" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 mt-2 w-64 rounded-lg border border-ink-200 bg-white p-2 shadow-lg">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded-md px-3 py-2 text-sm hover:bg-ink-100">
                {n.label}
              </Link>
            ))}
            <hr className="my-2 border-ink-200" />
            {user ? (
              <>
                <Link href="/mi-cuenta" className="block rounded-md px-3 py-2 text-sm hover:bg-ink-100">
                  Mi cuenta
                </Link>
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="block rounded-md px-3 py-2 text-sm hover:bg-ink-100">
                    Administración
                  </Link>
                )}
                <form action={signOutAction}>
                  <button className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-ink-100">Cerrar sesión</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/ingresar" className="block rounded-md px-3 py-2 text-sm hover:bg-ink-100">
                  Ingresar
                </Link>
                <Link href="/registro" className="block rounded-md px-3 py-2 text-sm font-medium text-brand-700 hover:bg-ink-100">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </details>
      </Container>
    </header>
  );
}

function UserMenu({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-ink-100">
        <UserRound className="h-4 w-4" aria-hidden />
        <span className="max-w-40 truncate">{name}</span>
      </summary>
      <div className="absolute right-0 mt-2 w-56 rounded-lg border border-ink-200 bg-white p-2 shadow-lg">
        <Link href="/mi-cuenta" className="block rounded-md px-3 py-2 text-sm hover:bg-ink-100">
          Mi aprendizaje
        </Link>
        <Link href="/mi-cuenta/eventos" className="block rounded-md px-3 py-2 text-sm hover:bg-ink-100">
          Mis eventos
        </Link>
        <Link href="/mi-cuenta/perfil" className="block rounded-md px-3 py-2 text-sm hover:bg-ink-100">
          Mi perfil
        </Link>
        {isAdmin && (
          <Link href="/admin" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-brand-700 hover:bg-ink-100">
            <ShieldCheck className="h-4 w-4" aria-hidden /> Administración
          </Link>
        )}
        <hr className="my-2 border-ink-200" />
        <form action={signOutAction}>
          <button className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-ink-100">Cerrar sesión</button>
        </form>
      </div>
    </details>
  );
}
