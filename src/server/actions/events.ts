"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/server/guards";
import { DomainError } from "@/server/services/enrollment";
import { cancelRegistration, registerForEvent } from "@/server/services/event-registration";
import type { ActionState } from "@/lib/validation/action";

export async function registerEventAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  const event = await db.event.findUnique({ where: { id: eventId }, select: { slug: true } });
  if (!event) return { error: "Evento no encontrado." };
  const user = await requireUser(`/eventos/${event.slug}`);
  try {
    const reg = await registerForEvent(user.id, eventId);
    revalidatePath(`/eventos/${event.slug}`);
    revalidatePath("/mi-cuenta", "layout");
    return {
      ok: true,
      message:
        reg.status === "CONFIRMED"
          ? "¡Inscripción confirmada! Le enviamos los detalles por correo."
          : "El cupo está completo. Quedó en lista de espera y le avisaremos si se libera un lugar.",
    };
  } catch (e) {
    if (e instanceof DomainError) return { error: e.message };
    throw e;
  }
}

export async function cancelEventAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const back = String(formData.get("back") ?? "/mi-cuenta/eventos");
  const user = await requireUser();
  const event = await db.event.findUnique({ where: { id: eventId }, select: { slug: true } });
  try {
    await cancelRegistration(user.id, eventId);
  } catch (e) {
    if (!(e instanceof DomainError)) throw e;
  }
  if (event) revalidatePath(`/eventos/${event.slug}`);
  revalidatePath("/mi-cuenta", "layout");
  redirect(back.startsWith("/") && !back.startsWith("//") ? back : "/mi-cuenta/eventos");
}
