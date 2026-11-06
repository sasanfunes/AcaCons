import { db } from "@/lib/db";

export async function resetDb() {
  const url = process.env.DATABASE_URL ?? "";
  if (!/_test\b/.test(new URL(url).pathname)) throw new Error("Los tests de integración solo corren sobre una base *_test");
  const tables = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tables.length) {
    await db.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"public"."${t.tablename}"`).join(", ")} CASCADE`);
  }
}

let n = 0;
export async function createUser(name = "Usuario") {
  n++;
  return db.user.create({ data: { id: crypto.randomUUID(), name: `${name} ${n}`, email: `u${n}-${Date.now()}@test.hn` } });
}

export async function createCourse({ lessons = 2, quiz = true } = {}) {
  const category = await db.category.create({ data: { name: "Mampostería", slug: `mamposteria-${crypto.randomUUID()}` } });
  const course = await db.course.create({
    data: {
      slug: `curso-${crypto.randomUUID()}`,
      title: "Bloque de concreto",
      summary: "Resumen",
      status: "PUBLISHED",
      estimatedMinutes: 150,
      categoryId: category.id,
      modules: {
        create: [
          {
            title: "Módulo 1",
            lessons: {
              create: Array.from({ length: lessons }, (_, i) => ({
                title: `Lección ${i + 1}`,
                position: i,
                videoProvider: "YOUTUBE" as const,
                videoId: "dQw4w9WgXcQ",
              })),
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });
  let quizRecord = null;
  if (quiz) {
    quizRecord = await db.quiz.create({
      data: {
        courseId: course.id,
        title: "Evaluación final",
        passingScore: 70,
        questions: {
          create: [
            { prompt: "P1", position: 0, options: { create: [{ text: "Sí", isCorrect: true }, { text: "No" }] } },
            { prompt: "P2", position: 1, options: { create: [{ text: "Sí", isCorrect: true }, { text: "No" }] } },
          ],
        },
      },
      include: { questions: { include: { options: true } } },
    });
  }
  return { course, lessons: course.modules[0]!.lessons, quiz: quizRecord };
}

export async function createEvent(capacity: number) {
  return db.event.create({
    data: {
      slug: `evento-${crypto.randomUUID()}`,
      title: "Taller de impermeabilización",
      summary: "Taller práctico",
      startsAt: new Date(Date.now() + 7 * 86400_000),
      endsAt: new Date(Date.now() + 7 * 86400_000 + 3 * 3600_000),
      venueName: "Centro de Capacitación",
      address: "Bulevar Morazán",
      city: "Tegucigalpa",
      capacity,
      status: "PUBLISHED",
    },
  });
}
