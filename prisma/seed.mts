import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { createDriver } from "../src/lib/storage/drivers.ts";
import { brands, categories, courses, events, instructors, SAMPLE_VIDEO } from "./seed/content.mts";
import { coverSvg, logoSvg, technicalSheetPdf } from "./seed/assets.mts";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const storage = createDriver(process.env, db);
const enc = new TextEncoder();

async function putSvg(key: string, svg: string) {
  await storage.put(key, enc.encode(svg), "image/svg+xml");
  return key;
}

async function ensureUser(email: string, password: string, name: string, role: "USER" | "ADMIN", extra: Record<string, string> = {}) {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== role) await db.user.update({ where: { id: existing.id }, data: { role } });
    return existing;
  }
  const id = crypto.randomUUID();
  const user = await db.user.create({
    data: { id, email, name, role, emailVerified: true, country: "HN", ...extra },
  });
  await db.account.create({
    data: { id: crypto.randomUUID(), accountId: id, providerId: "credential", userId: id, password: await hashPassword(password) },
  });
  return user;
}

async function main() {
  console.log("🌱 Sembrando datos…");

  const admin = await ensureUser(
    process.env.ADMIN_EMAIL ?? "admin@acacons.local",
    process.env.ADMIN_PASSWORD ?? "Admin12345!",
    process.env.ADMIN_NAME ?? "Administrador",
    "ADMIN",
  );
  console.log(`  admin: ${admin.email}`);
  if (process.env.NODE_ENV !== "production" || process.env.SEED_DEMO_USER === "true") {
    const demo = await ensureUser("estudiante@acacons.local", "Estudiante123!", "Lucía Hernández", "USER", {
      profession: "MAESTRO_DE_OBRA",
      department: "Francisco Morazán",
      city: "Tegucigalpa",
    });
    console.log(`  estudiante demo: ${demo.email} / Estudiante123!`);
  }

  const catIds: Record<string, string> = {};
  for (const [i, c] of categories.entries()) {
    const row = await db.category.upsert({
      where: { slug: c.slug },
      create: { ...c, position: i },
      update: { name: c.name, description: c.description, position: i },
    });
    catIds[c.slug] = row.id;
  }

  const brandIds: Record<string, string> = {};
  const sheetIds: Record<string, string[]> = {};
  for (const b of brands) {
    let row = await db.brand.findUnique({ where: { slug: b.slug } });
    if (!row) {
      const logoKey = await putSvg(`seed/brands/${b.slug}.svg`, logoSvg(b.name, b.color));
      row = await db.brand.create({ data: { slug: b.slug, name: b.name, description: b.description, website: b.website, logoKey } });
      for (const s of b.sheets) {
        const pdf = await technicalSheetPdf(b.name, s.title, s.product);
        const fileKey = `seed/sheets/${b.slug}-${s.product.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
        await storage.put(fileKey, pdf, "application/pdf");
        await db.technicalSheet.create({
          data: { brandId: row.id, title: s.title, productName: s.product, categoryId: catIds[s.category], fileKey, fileSize: pdf.byteLength },
        });
      }
    }
    brandIds[b.slug] = row.id;
    sheetIds[b.slug] = (await db.technicalSheet.findMany({ where: { brandId: row.id }, select: { id: true } })).map((s) => s.id);
  }

  const instructorIds: Record<string, string> = {};
  for (const ins of instructors) {
    const found = await db.instructor.findFirst({ where: { name: ins.name } });
    instructorIds[ins.key] = (found ?? (await db.instructor.create({ data: { name: ins.name, title: ins.title, bio: ins.bio } }))).id;
  }

  for (const c of courses) {
    // Las portadas de ejemplo se regeneran siempre (así un cambio de diseño llega también a bases existentes).
    const coverKey = await putSvg(`seed/courses/${c.slug}.svg`, coverSvg(c.title, c.color, categories.find((x) => x.slug === c.category)!.name));
    if (await db.course.findUnique({ where: { slug: c.slug } })) continue;
    const course = await db.course.create({
      data: {
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        description: c.description,
        level: c.level,
        estimatedMinutes: c.minutes,
        featured: c.featured ?? false,
        status: "PUBLISHED",
        publishedAt: new Date(),
        coverKey,
        categoryId: catIds[c.category]!,
        instructorId: instructorIds[c.instructor],
        sponsors: { connect: c.sponsors.map((s) => ({ id: brandIds[s]! })) },
        technicalSheets: { connect: c.sponsors.flatMap((s) => sheetIds[s] ?? []).map((id) => ({ id })) },
      },
    });
    for (const [mi, m] of c.modules.entries()) {
      const mod = await db.module.create({
        data: {
          courseId: course.id,
          title: m.title,
          position: mi,
          lessons: {
            create: m.lessons.map((l, li) => ({
              title: l.title,
              position: li,
              videoProvider: "YOUTUBE" as const,
              videoId: SAMPLE_VIDEO,
              durationMinutes: l.minutes,
              content: l.content,
              isPreview: l.preview ?? false,
            })),
          },
        },
      });
      if (m.quiz) await createQuiz(course.id, mod.id, m.quiz.title, 60, false, m.quiz.questions);
    }
    await createQuiz(course.id, null, c.finalQuiz.title, c.finalQuiz.passingScore, true, c.finalQuiz.questions);
    console.log(`  curso: ${c.title}`);
  }

  for (const e of events()) {
    const { category, sponsors, color, ...data } = e;
    const coverKey = await putSvg(`seed/events/${e.slug}.svg`, coverSvg(e.title, color, `Sesión técnica · ${e.city}`));
    if (await db.event.findUnique({ where: { slug: e.slug } })) continue;
    await db.event.create({
      data: {
        ...data,
        coverKey,
        status: "PUBLISHED",
        categoryId: catIds[category],
        sponsors: { connect: sponsors.map((s) => ({ id: brandIds[s]! })) },
      },
    });
    console.log(`  evento: ${e.title}`);
  }

  console.log("✅ Listo");
}

async function createQuiz(
  courseId: string,
  moduleId: string | null,
  title: string,
  passingScore: number,
  required: boolean,
  questions: { prompt: string; options: string[]; correct: number; explanation?: string }[],
) {
  await db.quiz.create({
    data: {
      courseId,
      moduleId,
      title,
      passingScore,
      required,
      questions: {
        create: questions.map((q, qi) => ({
          prompt: q.prompt,
          position: qi,
          explanation: q.explanation,
          options: { create: q.options.map((text, oi) => ({ text, position: oi, isCorrect: oi === q.correct })) },
        })),
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
