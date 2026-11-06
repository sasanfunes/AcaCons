import Link from "next/link";
import { ChevronDown, Menu, Search, ShieldCheck, UserRound } from "lucide-react";
import { getOptionalUser } from "@/server/guards";
import { signOutAction } from "@/server/actions/auth";
import { listCategoriesWithCourses } from "@/server/queries/courses";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "./logo";

function SearchBox({ className, id }: { className?: string; id: string }) {
  return (
    <form action="/cursos" role="search" className={className}>
      <label htmlFor={id} className="sr-only">
        Buscar cursos
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden />
        <input
          id={id}
          name="q"
          type="search"
          placeholder="Buscar cursos: concreto, impermeabilización, techos…"
          className="h-11 w-full rounded-full border border-ink-900 bg-marfil pl-11 pr-4 text-sm text-ink-900 placeholder:text-ink-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
    </form>
  );
}

const menuLink = "block rounded-md px-3 py-2 text-sm hover:bg-ink-50";

export async function Header() {
  const [user, categories] = await Promise.all([getOptionalUser(), listCategoriesWithCourses()]);
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white shadow-sm">
      <div className="mx-auto flex h-[4.5rem] max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Logo />
        <details className="relative hidden lg:block">
          <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink-800 hover:bg-ink-50">
            Categorías <ChevronDown className="h-4 w-4" aria-hidden />
          </summary>
          <div className="absolute left-0 mt-2 w-72 rounded-md border border-ink-200 bg-white p-2 shadow-xl">
            {categories.map((c) => (
              <Link key={c.id} href={`/cursos?categoria=${c.slug}`} className={`${menuLink} flex justify-between`}>
                <span>{c.name}</span>
                <span className="text-xs text-ink-500">{c._count.courses}</span>
              </Link>
            ))}
            <hr className="my-2 border-ink-200" />
            <Link href="/cursos" className={`${menuLink} font-semibold text-brand-700`}>
              Ver todos los cursos
            </Link>
          </div>
        </details>
        <SearchBox id="buscar" className="hidden flex-1 md:block" />
        <nav aria-label="Principal" className="ml-auto hidden items-center gap-1 lg:flex">
          <Link href="/eventos" className="rounded-md px-3 py-2 text-sm font-medium text-ink-800 hover:bg-ink-50">
            Eventos
          </Link>
          <Link href="/marcas" className="rounded-md px-3 py-2 text-sm font-medium text-ink-800 hover:bg-ink-50">
            Marcas
          </Link>
          {user && (
            <Link href="/mi-cuenta" className="rounded-md px-3 py-2 text-sm font-medium text-ink-800 hover:bg-ink-50">
              Mi aprendizaje
            </Link>
          )}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <UserMenu name={user.name} isAdmin={user.role === "ADMIN"} />
          ) : (
            <>
              <ButtonLink href="/ingresar" variant="outline">
                Ingresar
              </ButtonLink>
              <ButtonLink href="/registro" variant="accent">
                Crear cuenta
              </ButtonLink>
            </>
          )}
        </div>
        <details className="relative ml-auto md:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md hover:bg-ink-100" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 mt-2 max-h-[80vh] w-72 overflow-y-auto rounded-md border border-ink-200 bg-white p-2 shadow-xl">
            {user ? (
              <>
                <p className="px-3 py-2 text-sm font-semibold">{user.name}</p>
                <Link href="/mi-cuenta" className={menuLink}>
                  Mi aprendizaje
                </Link>
                <Link href="/mi-cuenta/eventos" className={menuLink}>
                  Mis eventos
                </Link>
                <Link href="/mi-cuenta/perfil" className={menuLink}>
                  Mi perfil
                </Link>
                {user.role === "ADMIN" && (
                  <Link href="/admin" className={menuLink}>
                    Administración
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/ingresar" className={menuLink}>
                  Ingresar
                </Link>
                <Link href="/registro" className={`${menuLink} font-semibold text-brand-700`}>
                  Crear cuenta
                </Link>
              </>
            )}
            <hr className="my-2 border-ink-200" />
            <p className="kicker px-3 py-1 text-ink-500">Categorías</p>
            {categories.map((c) => (
              <Link key={c.id} href={`/cursos?categoria=${c.slug}`} className={menuLink}>
                {c.name}
              </Link>
            ))}
            <hr className="my-2 border-ink-200" />
            <Link href="/cursos" className={menuLink}>
              Todos los cursos
            </Link>
            <Link href="/eventos" className={menuLink}>
              Eventos
            </Link>
            <Link href="/marcas" className={menuLink}>
              Marcas
            </Link>
            <Link href="/certificados/verificar" className={menuLink}>
              Verificar certificado
            </Link>
            {user && (
              <form action={signOutAction}>
                <button className={`${menuLink} w-full text-left`}>Cerrar sesión</button>
              </form>
            )}
          </div>
        </details>
      </div>
      <div className="border-t border-ink-100 px-4 pb-3 pt-2 md:hidden">
        <SearchBox id="buscar-movil" />
      </div>
    </header>
  );
}

function UserMenu({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <details className="relative">
      <summary
        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white"
        aria-label={`Menú de ${name}`}
      >
        {initials || <UserRound className="h-4 w-4" />}
      </summary>
      <div className="absolute right-0 mt-2 w-64 rounded-md border border-ink-200 bg-white p-2 shadow-xl">
        <p className="truncate px-3 py-2 text-sm font-semibold">{name}</p>
        <hr className="mb-2 border-ink-200" />
        <Link href="/mi-cuenta" className={menuLink}>
          Mi aprendizaje
        </Link>
        <Link href="/mi-cuenta/eventos" className={menuLink}>
          Mis eventos
        </Link>
        <Link href="/mi-cuenta/perfil" className={menuLink}>
          Mi perfil
        </Link>
        <Link href="/certificados/verificar" className={menuLink}>
          Verificar certificado
        </Link>
        {isAdmin && (
          <Link href="/admin" className={`${menuLink} flex items-center gap-2 text-brand-700`}>
            <ShieldCheck className="h-4 w-4" aria-hidden /> Administración
          </Link>
        )}
        <hr className="my-2 border-ink-200" />
        <form action={signOutAction}>
          <button className={`${menuLink} w-full text-left`}>Cerrar sesión</button>
        </form>
      </div>
    </details>
  );
}
