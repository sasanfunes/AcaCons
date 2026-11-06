import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { durationRanges, type CatalogQuery } from "@/lib/domain/catalog";

export const courseCardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  coverKey: true,
  level: true,
  estimatedMinutes: true,
  featured: true,
  outcomes: true,
  category: { select: { name: true, slug: true } },
  instructor: { select: { name: true } },
  sponsors: { select: { name: true, slug: true } },
  modules: { select: { _count: { select: { lessons: true } } } },
  _count: { select: { enrollments: true } },
} satisfies Prisma.CourseSelect;

export type CourseCardData = Prisma.CourseGetPayload<{ select: typeof courseCardSelect }>;

const ORDER: Record<CatalogQuery["orden"], Prisma.CourseOrderByWithRelationInput[]> = {
  relevancia: [{ featured: "desc" }, { enrollments: { _count: "desc" } }, { publishedAt: "desc" }],
  recientes: [{ publishedAt: "desc" }],
  populares: [{ enrollments: { _count: "desc" } }, { publishedAt: "desc" }],
  cortos: [{ estimatedMinutes: "asc" }],
};

export async function listPublishedCourses(f: CatalogQuery) {
  const and: Prisma.CourseWhereInput[] = [{ status: "PUBLISHED" }];
  if (f.categorias.length) and.push({ category: { slug: { in: f.categorias } } });
  if (f.marcas.length) and.push({ sponsors: { some: { slug: { in: f.marcas } } } });
  if (f.niveles.length) and.push({ level: { in: f.niveles } });
  if (f.duraciones.length) {
    and.push({
      OR: durationRanges(f.duraciones).map((r) => ({
        estimatedMinutes: r.max === null ? { gte: r.min } : { gte: r.min, lte: r.max },
      })),
    });
  }
  if (f.q) {
    and.push({
      OR: [
        { title: { contains: f.q, mode: "insensitive" } },
        { summary: { contains: f.q, mode: "insensitive" } },
        { category: { name: { contains: f.q, mode: "insensitive" } } },
        { sponsors: { some: { name: { contains: f.q, mode: "insensitive" } } } },
      ],
    });
  }
  return db.course.findMany({ where: { AND: and }, select: courseCardSelect, orderBy: ORDER[f.orden] });
}

export function recentCourses(take = 10) {
  return db.course.findMany({ where: { status: "PUBLISHED" }, select: courseCardSelect, orderBy: { publishedAt: "desc" }, take });
}

export function coursesInCategory(categoryId: string, excludeId?: string, take = 10) {
  return db.course.findMany({
    where: { status: "PUBLISHED", categoryId, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: courseCardSelect,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take,
  });
}

/** Cursos publicados agrupados por categoría (pestañas del inicio). */
export async function coursesByCategory(perCategory = 10) {
  const categories = await listCategoriesWithCourses();
  return Promise.all(
    categories.map(async (c) => ({ ...c, courses: await coursesInCategory(c.id, undefined, perCategory) })),
  );
}

export function featuredCourses(take = 10) {
  return db.course.findMany({
    where: { status: "PUBLISHED" },
    select: courseCardSelect,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take,
  });
}

/** Categorías con cursos publicados (menú del encabezado, filtros). Memoizado por request. */
export const listCategoriesWithCourses = cache(function listCategoriesWithCourses() {
  return db.category.findMany({
    where: { courses: { some: { status: "PUBLISHED" } } },
    orderBy: { position: "asc" },
    select: { id: true, name: true, slug: true, _count: { select: { courses: { where: { status: "PUBLISHED" } } } } },
  });
});

export async function getCourseBySlug(slug: string, { includeDrafts = false } = {}) {
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: true,
      sponsors: { select: { id: true, name: true, slug: true, logoKey: true } },
      technicalSheets: { include: { brand: { select: { name: true, slug: true } } } },
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: { id: true, title: true, durationMinutes: true, isPreview: true, position: true },
          },
          quizzes: { select: { id: true, title: true, required: true } },
        },
      },
      quizzes: {
        where: { moduleId: null },
        select: { id: true, title: true, required: true, passingScore: true, _count: { select: { questions: true } } },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course || (!includeDrafts && course.status !== "PUBLISHED")) return null;
  return course;
}

export type CourseDetail = NonNullable<Awaited<ReturnType<typeof getCourseBySlug>>>;

export function lessonOrder(course: CourseDetail) {
  return course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
}

export async function getUserCourseState(userId: string | undefined, courseId: string) {
  if (!userId) return null;
  const [enrollment, progress, attempts, certificate] = await Promise.all([
    db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } }),
    db.lessonProgress.findMany({ where: { userId, lesson: { module: { courseId } } }, select: { lessonId: true } }),
    db.quizAttempt.findMany({
      where: { userId, quiz: { courseId } },
      select: { quizId: true, score: true, passed: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    db.certificate.findUnique({ where: { userId_courseId: { userId, courseId } } }),
  ]);
  if (!enrollment) return null;
  const bestByQuiz = new Map<string, { score: number; passed: boolean }>();
  for (const a of attempts) {
    const prev = bestByQuiz.get(a.quizId);
    if (!prev || a.score > prev.score) bestByQuiz.set(a.quizId, { score: a.score, passed: a.passed || (prev?.passed ?? false) });
    else if (a.passed) prev.passed = true;
  }
  return {
    enrollment,
    completedIds: new Set(progress.map((p) => p.lessonId)),
    bestByQuiz,
    certificate,
  };
}

export type UserCourseState = NonNullable<Awaited<ReturnType<typeof getUserCourseState>>>;

export async function getLessonForPlayer(lessonId: string) {
  return db.lesson.findUnique({ where: { id: lessonId }, include: { module: { select: { courseId: true, title: true } } } });
}

export async function getQuizForTaking(quizId: string) {
  return db.quiz.findUnique({
    where: { id: quizId },
    include: {
      module: { select: { title: true } },
      questions: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          prompt: true,
          options: { orderBy: { position: "asc" }, select: { id: true, text: true } },
        },
      },
    },
  });
}

export async function getQuizReview(quizId: string) {
  return db.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { position: "asc" },
        include: { options: { orderBy: { position: "asc" } } },
      },
    },
  });
}
