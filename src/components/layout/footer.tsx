import Link from "next/link";
import { Container } from "@/components/ui/misc";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t-8 border-brand-500 bg-ink-900 text-ink-300">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Logo dark />
          <p className="mt-4 max-w-md text-sm">
            Formación técnica para arquitectos, ingenieros y constructores de Honduras y Centroamérica.
          </p>
          <p className="kicker mt-4 text-brand-500">Un programa de Construnova</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Aprender</p>
          <ul className="space-y-1 text-sm">
            <li><Link href="/cursos" className="hover:text-white">Cursos</Link></li>
            <li><Link href="/eventos" className="hover:text-white">Eventos presenciales</Link></li>
            <li><Link href="/marcas" className="hover:text-white">Marcas y fichas técnicas</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Cuenta</p>
          <ul className="space-y-1 text-sm">
            <li><Link href="/registro" className="hover:text-white">Crear cuenta</Link></li>
            <li><Link href="/mi-cuenta" className="hover:text-white">Mi aprendizaje</Link></li>
            <li><Link href="/certificados/verificar" className="hover:text-white">Verificar certificado</Link></li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-ink-800 py-4 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} La Academia del Constructor. Todos los derechos reservados.
      </div>
    </footer>
  );
}
