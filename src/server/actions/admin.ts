"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { slugify } from "@/lib/domain/slug";
import { parseVideoUrl } from "@/lib/domain/video";
import { zonedLocalToUtc } from "@/lib/format";
import { saveUpload, storage, type UploadKind } from "@/lib/storage";
import { requireAdmin } from "@/server/guards";
import { checkInByTicket, rebalanceWaitlist } from "@/server/services/event-registration";
import { DomainError } from "@/server/services/enrollment";
import { formToObject, type ActionState, validationError } from "@/lib/validation/action";
import {
  brandSchema,
  categorySchema,
  courseSchema,
  eventSchema,
  instructorSchema,
  lessonSchema,
  moduleSchema,
  questionSchema,
  quizSchema,
  sheetSchema,
} from "@/lib/validation/admin";

type SlugModel = "course" | "event" | "brand" | "category";

async function uniqueSlug(model: SlugModel, base: string, excludeId?: string) {
  const root = slugify(base) || "item";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = await (db[model] as any).findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!found || found.id === excludeId) return candidate;
  }
  return `${root}-${crypto.randomUUID().slice(0, 6)}`;
}

function getFile(formData: FormData, name: string): File | null {
  const f = formData.get(name);
  return f instanceof File && f.size > 0 ? f : null;
}

async function maybeUpload(formData: FormData, field: string, kind: UploadKind, prefix: string) {
  const file = getFile(formData, field);
  if (!file) return { key: undefined as string | undefined };
  const r = await saveUpload(file, kind, prefix);
  if ("error" in r) return { error: r.error };
  return { key: r.key, size: r.size };
}

async function removeFile(key: string | null | undefined) {
  if (key && !key.startsWith("seed/")) await storage.delete(key).catch(() => undefined);
}

const fail = (error: string, field?: string): ActionState =>
  field ? { error, fieldErrors: { [field]: [error] } } : { error };

// ───────────────────────────── Cursos ─────────────────────────────

export async function saveCourseAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || undefined;
  const parsed = courseSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationError(parsed.error, formData);
  const d = parsed.data;
  const cover = await maybeUpload(formData, "cover", "image", "courses");
  if (cover.error) return fail(cover.error, "cover");

  const existing = id ? await db.course.findUnique({ where: { id } }) : null;
  const slug = await uniqueSlug("course", d.slug || d.title, id);
  const data = {
    title: d.title,
    slug,
    summary: d.summary,
    description: d.description,
    level: d.level,
    estimatedMinutes: d.estimatedMinutes,
    categoryId: d.categoryId,
    instructorId: d.instructorId,
    status: d.status,
    featured: d.featured,
    publishedAt: d.status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt,
    ...(cover.key ? { coverKey: cover.key } : {}),
  };
  let courseId: string;
  if (existing) {
    await db.course.update({
      where: { id: existing.id },
      data: {
        ...data,
        sponsors: { set: d.sponsorIds.map((s) => ({ id: s })) },
        technicalSheets: { set: d.sheetIds.map((s) => ({ id: s })) },
      },
    });
    if (cover.key) await removeFile(existing.coverKey);
    courseId = existing.id;
  } else {
    const created = await db.course.create({
      data: {
        ...data,
        sponsors: { connect: d.sponsorIds.map((s) => ({ id: s })) },
        technicalSheets: { connect: d.sheetIds.map((s) => ({ id: s })) },
      },
    });
    courseId = created.id;
  }
  revalidatePath("/", "layout");
  if (!existing) redirect(`/admin/cursos/${courseId}?creado=1`);
  return { ok: true, message: "Curso guardado." };
}

export async function deleteCourseAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const course = await db.course.findUnique({ where: { id }, include: { _count: { select: { enrollments: true } } } });
  if (!course) redirect("/admin/cursos");
  if (course._count.enrollments > 0) {
    // Con alumnos inscritos solo se archiva, para conservar el historial y los certificados.
    await db.course.update({ where: { id }, data: { status: "ARCHIVED" } });
  } else {
    await db.course.delete({ where: { id } });
    await removeFile(course.coverKey);
  }
  revalidatePath("/", "layout");
  redirect("/admin/cursos");
}

async function courseIdForModule(moduleId: string) {
  return (await db.module.findUniqueOrThrow({ where: { id: moduleId }, select: { courseId: true } })).courseId;
}

export async function saveModuleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = moduleSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (id) {
    await db.module.update({ where: { id }, data: { title: parsed.data.title } });
  } else {
    const last = await db.module.findFirst({ where: { courseId }, orderBy: { position: "desc" }, select: { position: true } });
    await db.module.create({ data: { courseId, title: parsed.data.title, position: (last?.position ?? -1) + 1 } });
  }
  revalidatePath(`/admin/cursos/${courseId}`);
  revalidatePath("/cursos", "layout");
  return { ok: true, message: id ? "Módulo actualizado." : "Módulo creado." };
}

export async function deleteModuleAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const courseId = await courseIdForModule(id);
  await db.module.delete({ where: { id } });
  await normalizePositions("module", { courseId });
  revalidatePath(`/admin/cursos/${courseId}`);
  revalidatePath("/cursos", "layout");
}

export async function saveLessonAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = lessonSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationError(parsed.error, formData);
  const video = parseVideoUrl(parsed.data.videoUrl);
  if (!video) return fail("No reconocemos la URL. Use un enlace de YouTube o Vimeo.", "videoUrl");
  const id = String(formData.get("id") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "");
  const data = {
    title: parsed.data.title,
    durationMinutes: parsed.data.durationMinutes,
    content: parsed.data.content,
    isPreview: parsed.data.isPreview,
    videoProvider: video.provider,
    videoId: video.id,
    videoHash: video.hash ?? null,
  };
  let courseId: string;
  if (id) {
    const lesson = await db.lesson.update({ where: { id }, data, select: { module: { select: { courseId: true } } } });
    courseId = lesson.module.courseId;
  } else {
    const last = await db.lesson.findFirst({ where: { moduleId }, orderBy: { position: "desc" }, select: { position: true } });
    await db.lesson.create({ data: { ...data, moduleId, position: (last?.position ?? -1) + 1 } });
    courseId = await courseIdForModule(moduleId);
  }
  revalidatePath(`/admin/cursos/${courseId}`);
  revalidatePath("/cursos", "layout");
  return { ok: true, message: id ? "Lección actualizada." : "Lección creada." };
}

export async function deleteLessonAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const lesson = await db.lesson.delete({ where: { id }, select: { moduleId: true, module: { select: { courseId: true } } } });
  await normalizePositions("lesson", { moduleId: lesson.moduleId });
  revalidatePath(`/admin/cursos/${lesson.module.courseId}`);
  revalidatePath("/cursos", "layout");
}

type Positioned = "module" | "lesson" | "question";

async function normalizePositions(model: Positioned, where: Record<string, string>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = db[model] as any;
  const rows: { id: string }[] = await m.findMany({ where, orderBy: { position: "asc" }, select: { id: true } });
  await db.$transaction(rows.map((r, i) => m.update({ where: { id: r.id }, data: { position: i } })));
}

/** Mueve un módulo, lección o pregunta una posición hacia arriba o abajo. */
export async function moveItemAction(formData: FormData) {
  await requireAdmin();
  const model = String(formData.get("model")) as Positioned;
  if (!["module", "lesson", "question"].includes(model)) return;
  const id = String(formData.get("id"));
  const dir = formData.get("dir") === "up" ? -1 : 1;
  const parentField = model === "module" ? "courseId" : model === "lesson" ? "moduleId" : "quizId";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = db[model] as any;
  const item = await m.findUnique({ where: { id } });
  if (!item) return;
  await normalizePositions(model, { [parentField]: item[parentField] });
  const siblings: { id: string }[] = await m.findMany({ where: { [parentField]: item[parentField] }, orderBy: { position: "asc" }, select: { id: true } });
  const idx = siblings.findIndex((s) => s.id === id);
  const swap = siblings[idx + dir];
  if (!swap) return;
  await db.$transaction([
    m.update({ where: { id }, data: { position: idx + dir } }),
    m.update({ where: { id: swap.id }, data: { position: idx } }),
  ]);
  revalidatePath("/admin", "layout");
  revalidatePath("/cursos", "layout");
}

// ───────────────────────────── Evaluaciones ─────────────────────────────

export async function saveQuizAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = quizSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const data = { title: parsed.data.title, passingScore: parsed.data.passingScore, required: parsed.data.required, moduleId: parsed.data.moduleId };
  if (id) {
    await db.quiz.update({ where: { id }, data });
    revalidatePath(`/admin/cursos/${courseId}`, "layout");
    return { ok: true, message: "Evaluación actualizada." };
  }
  const quiz = await db.quiz.create({ data: { ...data, courseId } });
  redirect(`/admin/cursos/${courseId}/evaluaciones/${quiz.id}`);
}

export async function deleteQuizAction(formData: FormData) {
  await requireAdmin();
  const quiz = await db.quiz.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/cursos", "layout");
  redirect(`/admin/cursos/${quiz.courseId}`);
}

export async function saveQuestionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = formToObject(formData);
  const parsed = questionSchema.safeParse({ ...raw, options: [raw.option0, raw.option1, raw.option2, raw.option3].map((o) => String(o ?? "")), correct: raw.correct ?? -1 });
  if (!parsed.success) return validationError(parsed.error, formData);
  const { prompt, explanation, correct } = parsed.data;
  // Recalcula el índice de la correcta luego de descartar opciones vacías.
  const rawOptions = [raw.option0, raw.option1, raw.option2, raw.option3].map((o) => String(o ?? "").trim());
  if (!rawOptions[correct]) return fail("La respuesta correcta debe tener texto", "correct");
  const options = rawOptions
    .map((text, i) => ({ text, isCorrect: i === correct }))
    .filter((o) => o.text)
    .map((o, position) => ({ ...o, position }));
  const id = String(formData.get("id") ?? "");
  const quizId = String(formData.get("quizId") ?? "");
  if (id) {
    await db.$transaction([
      db.option.deleteMany({ where: { questionId: id } }),
      db.question.update({ where: { id }, data: { prompt, explanation, options: { create: options } } }),
    ]);
  } else {
    const last = await db.question.findFirst({ where: { quizId }, orderBy: { position: "desc" }, select: { position: true } });
    await db.question.create({ data: { quizId, prompt, explanation, position: (last?.position ?? -1) + 1, options: { create: options } } });
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: id ? "Pregunta actualizada." : "Pregunta agregada." };
}

export async function deleteQuestionAction(formData: FormData) {
  await requireAdmin();
  const q = await db.question.delete({ where: { id: String(formData.get("id")) } });
  await normalizePositions("question", { quizId: q.quizId });
  revalidatePath("/admin", "layout");
}

// ───────────────────────────── Eventos ─────────────────────────────

export async function saveEventAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = eventSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationError(parsed.error, formData);
  const d = parsed.data;
  const id = String(formData.get("id") ?? "") || undefined;
  const cover = await maybeUpload(formData, "cover", "image", "events");
  if (cover.error) return fail(cover.error, "cover");
  const existing = id ? await db.event.findUnique({ where: { id } }) : null;
  const data = {
    title: d.title,
    slug: await uniqueSlug("event", d.slug || d.title, id),
    summary: d.summary,
    description: d.description,
    timezone: d.timezone,
    startsAt: zonedLocalToUtc(d.startsAt, d.timezone),
    endsAt: zonedLocalToUtc(d.endsAt, d.timezone),
    registrationClosesAt: d.registrationClosesAt ? zonedLocalToUtc(d.registrationClosesAt, d.timezone) : null,
    venueName: d.venueName,
    address: d.address,
    city: d.city,
    department: d.department,
    country: d.country,
    mapUrl: d.mapUrl,
    capacity: d.capacity,
    categoryId: d.categoryId,
    status: d.status,
    ...(cover.key ? { coverKey: cover.key } : {}),
  };
  let eventId: string;
  if (existing) {
    await db.event.update({ where: { id: existing.id }, data: { ...data, sponsors: { set: d.sponsorIds.map((s) => ({ id: s })) } } });
    if (cover.key) await removeFile(existing.coverKey);
    eventId = existing.id;
  } else {
    eventId = (await db.event.create({ data: { ...data, sponsors: { connect: d.sponsorIds.map((s) => ({ id: s })) } } })).id;
  }
  const promoted = existing && d.capacity > existing.capacity ? await rebalanceWaitlist(eventId) : 0;
  revalidatePath("/", "layout");
  if (!existing) redirect(`/admin/eventos/${eventId}?creado=1`);
  return { ok: true, message: promoted ? `Evento guardado. Se confirmaron ${promoted} personas de la lista de espera.` : "Evento guardado." };
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const event = await db.event.findUnique({ where: { id }, include: { _count: { select: { registrations: true } } } });
  if (event) {
    if (event._count.registrations > 0) await db.event.update({ where: { id }, data: { status: "ARCHIVED" } });
    else {
      await db.event.delete({ where: { id } });
      await removeFile(event.coverKey);
    }
  }
  revalidatePath("/", "layout");
  redirect("/admin/eventos");
}

export async function checkInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const eventId = String(formData.get("eventId"));
  const code = String(formData.get("ticketCode") ?? "").trim().toUpperCase().replace(/\s+/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
  if (!code) return fail("Ingrese el código de entrada.", "ticketCode");
  try {
    const r = await checkInByTicket(eventId, code);
    revalidatePath(`/admin/eventos/${eventId}/inscritos`);
    return {
      ok: true,
      message: r.alreadyCheckedIn ? `${r.registration.user.name} ya había ingresado.` : `✔ Asistencia registrada: ${r.registration.user.name}`,
    };
  } catch (e) {
    if (e instanceof DomainError) return { error: e.message };
    throw e;
  }
}

export async function toggleAttendanceAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const reg = await db.eventRegistration.findUniqueOrThrow({ where: { id } });
  await db.eventRegistration.update({ where: { id }, data: { checkedInAt: reg.checkedInAt ? null : new Date() } });
  revalidatePath(`/admin/eventos/${reg.eventId}/inscritos`);
}

// ───────────────────────────── Marcas ─────────────────────────────

export async function saveBrandAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = brandSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationError(parsed.error, formData);
  const d = parsed.data;
  const id = String(formData.get("id") ?? "") || undefined;
  const logo = await maybeUpload(formData, "logo", "image", "brands");
  if (logo.error) return fail(logo.error, "logo");
  const existing = id ? await db.brand.findUnique({ where: { id } }) : null;
  const data = {
    name: d.name,
    slug: await uniqueSlug("brand", d.slug || d.name, id),
    description: d.description,
    website: d.website,
    status: d.status,
    ...(logo.key ? { logoKey: logo.key } : {}),
  };
  if (existing) {
    await db.brand.update({ where: { id: existing.id }, data });
    if (logo.key) await removeFile(existing.logoKey);
  } else {
    const b = await db.brand.create({ data });
    revalidatePath("/", "layout");
    redirect(`/admin/marcas/${b.id}?creado=1`);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Marca guardada." };
}

export async function deleteBrandAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const brand = await db.brand.findUnique({ where: { id }, include: { technicalSheets: true } });
  if (brand) {
    await db.brand.delete({ where: { id } });
    await removeFile(brand.logoKey);
    for (const s of brand.technicalSheets) await removeFile(s.fileKey);
  }
  revalidatePath("/", "layout");
  redirect("/admin/marcas");
}

export async function addSheetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const brandId = String(formData.get("brandId"));
  const parsed = sheetSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationError(parsed.error, formData);
  const file = getFile(formData, "file");
  if (!file) return fail("Seleccione el PDF de la ficha técnica.", "file");
  const up = await saveUpload(file, "pdf", `brands/${brandId}`);
  if ("error" in up) return fail(up.error, "file");
  await db.technicalSheet.create({ data: { brandId, ...parsed.data, fileKey: up.key, fileSize: up.size } });
  revalidatePath("/", "layout");
  return { ok: true, message: "Ficha técnica agregada." };
}

export async function deleteSheetAction(formData: FormData) {
  await requireAdmin();
  const sheet = await db.technicalSheet.delete({ where: { id: String(formData.get("id")) } });
  await removeFile(sheet.fileKey);
  revalidatePath("/", "layout");
}

// ───────────────────────────── Categorías e instructores ─────────────────────────────

export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationError(parsed.error, formData);
  const id = String(formData.get("id") ?? "") || undefined;
  const data = { ...parsed.data, slug: await uniqueSlug("category", parsed.data.slug || parsed.data.name, id) };
  if (id) await db.category.update({ where: { id }, data });
  else await db.category.create({ data });
  revalidatePath("/", "layout");
  return { ok: true, message: "Categoría guardada." };
}

export async function deleteCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const count = await db.course.count({ where: { categoryId: id } });
  if (count) return { error: `No se puede eliminar: tiene ${count} curso(s) asociados.` };
  await db.category.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true, message: "Categoría eliminada." };
}

export async function saveInstructorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = instructorSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationError(parsed.error, formData);
  const id = String(formData.get("id") ?? "") || undefined;
  if (id) await db.instructor.update({ where: { id }, data: parsed.data });
  else await db.instructor.create({ data: parsed.data });
  revalidatePath("/", "layout");
  return { ok: true, message: "Instructor guardado." };
}

export async function deleteInstructorAction(formData: FormData) {
  await requireAdmin();
  await db.instructor.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/", "layout");
}

// ───────────────────────────── Usuarios ─────────────────────────────

export async function setUserRoleAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "USER";
  if (id === admin.id && role !== "ADMIN") return; // no puede quitarse su propio rol
  await db.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/usuarios");
}
