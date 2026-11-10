import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center p-8 text-center">
      <p className="inline-block border-b-8 border-brand-500 text-5xl font-bold text-ink-900">403</p>
      <h1 className="mt-2 text-xl font-semibold">No tiene permiso para ver esta página</h1>
      <Link href="/" className="mt-6 text-brand-700 underline">
        Volver al inicio
      </Link>
    </main>
  );
}
