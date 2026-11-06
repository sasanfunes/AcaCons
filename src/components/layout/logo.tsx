/* eslint-disable @next/next/no-img-element -- el imagotipo es un SVG estático de /public/brand. */
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Imagotipo oficial (manual de marca): versión principal sobre fondos claros y negativo sobre azul.
 * Es arte final: no se recompone con texto. Ancho mínimo 120 px.
 */
export function Logo({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0 py-1", className)} aria-label="La Academia del Constructor, inicio">
      <img
        src={dark ? "/brand/logo-negativo.svg" : "/brand/logo.svg"}
        alt="La Academia del Constructor"
        width={205}
        height={40}
        className="h-10 w-auto min-w-[120px]"
      />
    </Link>
  );
}
