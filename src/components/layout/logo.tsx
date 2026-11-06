import Link from "next/link";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold tracking-tight" aria-label="Academia del Constructor, inicio">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect width="32" height="32" rx="6" fill="#ea580c" />
        <path d="M6 24 L16 7 L26 24 Z" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M11 24 v-5 h10 v5" fill="none" stroke="#fff" strokeWidth="2.5" />
      </svg>
      <span className={dark ? "text-white" : "text-ink-900"}>
        Academia <span className="text-brand-600">del Constructor</span>
      </span>
    </Link>
  );
}
