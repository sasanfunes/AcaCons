import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { LEVELS } from "@/lib/constants";

export const courseCardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  coverKey: true,
  level: true,
  estimatedMinutes: true,
  featured: true,
  category: { select: { name: true, slug: true } },
  instructor: { select: { name: true } },
  sponsors: { select: { name: true, slug: true } },
  modules: { select: { _count: { select: { lessons: true } } } },
} satisfies Prisma.CourseSelect;

export type CourseCardData = Prisma.CourseGetPayload<{ select: typeof courseCardSelect }>;

export type CatalogFilters = { categoria?: string; marca?: string; nivel?: string; q?: string };

export async function listPublishedCourses(f: CatalogFilters = {}) {
  const where: Prisma.CourseWhereInput = { status: "PUBLISHED" };
  if (f.categoria) where.category = { slug: f.categoria };
  if (f.marca) where.sponsors = { some: { slug: f.marca } };
  if (f.nivel && f.nivel in LEVELS) where.level = f.nivel as keyof typeof LEVELS;
  if (f.q?.trim()) {
    const q = f.q.trim().slice(0, 100);
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  return db.course.findMany({
    where,
    select: courseCardSelect,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });
}

export function featuredCourses(take = 3) {
  return db.course.findMany({
    where: { status: "PUBLISHED" },
    select: courseCardSelect,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take,
  });
}

export function listCategoriesWithCourses() {
  return db.category.findMany({
    where: { courses: { some: { status: "PUBLISHED" } } },
    orderBy: { position: "asc" },
    select: { id: true, name: true, slug: true, _count: { select: { courses: { where: { status: "PUBLISHED" } } } } },
  });
}

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
