import { env } from "@/lib/env";

function layout(title: string, body: string) {
  return `<!doctype html><html lang="es"><body style="font-family:Poppins,Arial,sans-serif;background:#FBFAF7;padding:24px;color:#2C2C2A">
<table role="presentation" width="100%" style="max-width:560px;margin:auto;background:#fff;border:1px solid #E0DDD6">
<tr><td style="background:#2C2C2A;border-left:8px solid #FFC20E;padding:18px 24px">
<img src="${env.APP_URL}/brand/logo-negativo.png" alt="La Academia del Constructor" width="180" style="display:block;height:auto"></td></tr>
<tr><td style="padding:24px;line-height:1.6"><h1 style="font-size:20px;margin:0 0 12px;color:#2C2C2A">${title}</h1>${body}</td></tr>
<tr><td style="padding:16px 24px;color:#5E5C57;font-size:12px;border-top:1px solid #E0DDD6">Un programa de Construnova. Este es un mensaje automático, por favor no lo responda.</td></tr>
</table></body></html>`;
}

function button(href: string, label: string) {
  return `<p><a href="${href}" style="display:inline-block;background:#2C2C2A;color:#fff;padding:10px 18px;border-radius:4px;text-decoration:none;font-weight:600">${label}</a></p>`;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function verificationEmail(name: string, url: string) {
  return {
    subject: "Confirme su correo electrónico",
    html: layout(
      `Hola, ${esc(name)}`,
      `<p>Gracias por registrarse en La Academia del Constructor. Para activar su cuenta confirme su correo:</p>${button(url, "Confirmar correo")}<p style="font-size:12px;color:#5E5C57">Si el botón no funciona, copie este enlace: ${url}</p>`,
    ),
    text: `Confirme su correo: ${url}`,
  };
}

export function resetPasswordEmail(name: string, url: string) {
  return {
    subject: "Restablecer contraseña",
    html: layout(
      `Hola, ${esc(name)}`,
      `<p>Recibimos una solicitud para restablecer su contraseña. El enlace vence en 1 hora.</p>${button(url, "Crear nueva contraseña")}<p>Si usted no lo solicitó, puede ignorar este mensaje.</p>`,
    ),
    text: `Restablezca su contraseña: ${url}`,
  };
}

type EventInfo = { title: string; slug: string; when: string; venue: string };

export function eventRegistrationEmail(name: string, ev: EventInfo, status: "CONFIRMED" | "WAITLISTED", ticketCode: string) {
  const url = `${env.APP_URL}/mi-cuenta/eventos`;
  const body =
    status === "CONFIRMED"
      ? `<p>Su inscripción a <strong>${esc(ev.title)}</strong> está <strong>confirmada</strong>.</p>
         <p>📅 ${esc(ev.when)}<br>📍 ${esc(ev.venue)}</p>
         <p>Código de entrada: <strong style="font-family:monospace">${ticketCode}</strong></p>${button(url, "Ver mi entrada")}`
      : `<p>El evento <strong>${esc(ev.title)}</strong> no tiene cupos disponibles por ahora. Quedó en <strong>lista de espera</strong> y le avisaremos por correo si se libera un lugar.</p>${button(url, "Ver mis eventos")}`;
  return {
    subject: status === "CONFIRMED" ? `Inscripción confirmada: ${ev.title}` : `Lista de espera: ${ev.title}`,
    html: layout(`Hola, ${esc(name)}`, body),
  };
}

export function waitlistPromotedEmail(name: string, ev: EventInfo, ticketCode: string) {
  const url = `${env.APP_URL}/mi-cuenta/eventos`;
  return {
    subject: `¡Se liberó un cupo! ${ev.title}`,
    html: layout(
      `Hola, ${esc(name)}`,
      `<p>Se liberó un lugar y su inscripción a <strong>${esc(ev.title)}</strong> ahora está <strong>confirmada</strong>.</p>
       <p>📅 ${esc(ev.when)}<br>📍 ${esc(ev.venue)}</p>
       <p>Código de entrada: <strong style="font-family:monospace">${ticketCode}</strong></p>${button(url, "Ver mi entrada")}`,
    ),
  };
}

export function questionAnsweredEmail(name: string, questionTitle: string, courseTitle: string, answer: string, url: string) {
  return {
    subject: `Respondieron su pregunta: ${questionTitle}`,
    html: layout(
      `Hola, ${esc(name)}`,
      `<p>El equipo académico respondió su pregunta <strong>«${esc(questionTitle)}»</strong> del curso <strong>${esc(courseTitle)}</strong>:</p>
       <blockquote style="margin:12px 0;padding:12px 16px;border-left:4px solid #FFC20E;background:#FBFAF7">${esc(answer).replace(/\n/g, "<br>")}</blockquote>${button(url, "Ver la conversación")}`,
    ),
  };
}
