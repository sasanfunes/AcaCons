import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { normalizeCode } from "@/lib/domain/codes";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Card, Container } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Verificar certificado" };

async function verify(formData: FormData) {
  "use server";
  const code = normalizeCode(String(formData.get("code") ?? ""));
  if (code) redirect(`/certificados/${encodeURIComponent(code)}`);
}

export default function VerifyPage() {
  return (
    <Container className="max-w-xl py-16">
      <Card className="p-8">
        <ShieldCheck className="h-10 w-10 rounded-md bg-brand-500 p-2 text-ink-900" aria-hidden />
        <h1 className="mt-3 text-2xl font-bold">Verificar un certificado</h1>
        <p className="mt-1 text-ink-600">
          Ingrese el código que aparece en el certificado (por ejemplo <span className="font-mono">CERT-7K3M-Q9XD-2HPA</span>) o
          escanee el código QR.
        </p>
        <form action={verify} className="mt-6 space-y-4">
          <Field label="Código del certificado" htmlFor="code">
            <Input id="code" name="code" required className="font-mono uppercase" autoComplete="off" placeholder="CERT-XXXX-XXXX-XXXX" />
          </Field>
          <Button type="submit">Verificar</Button>
        </form>
      </Card>
    </Container>
  );
}
