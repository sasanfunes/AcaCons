import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";

export type EmailMessage = { to: string; subject: string; html: string; text?: string };

/** Últimos emails enviados con el driver "console" (útil en tests y desarrollo). */
export const sentEmails: EmailMessage[] = [];

let resend: Resend | null = null;

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (env.EMAIL_DRIVER === "resend") {
    if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY no configurada");
    resend ??= new Resend(env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: env.EMAIL_FROM, ...message });
    if (error) throw new Error(`Error enviando email: ${error.message}`);
    return;
  }
  sentEmails.push(message);
  if (sentEmails.length > 50) sentEmails.shift();
  console.info(
    `\n📧 [email] Para: ${message.to}\n   Asunto: ${message.subject}\n   ${message.text ?? stripHtml(message.html)}\n`,
  );
}

function stripHtml(html: string) {
  return html
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, "$2 ($1)")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
