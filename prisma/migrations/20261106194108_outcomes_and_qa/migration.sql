-- AlterTable
ALTER TABLE "course" ADD COLUMN     "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "lesson_question" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_answer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_question_lessonId_createdAt_idx" ON "lesson_question"("lessonId", "createdAt");

-- CreateIndex
CREATE INDEX "lesson_question_createdAt_idx" ON "lesson_question"("createdAt");

-- CreateIndex
CREATE INDEX "lesson_answer_questionId_createdAt_idx" ON "lesson_answer"("questionId", "createdAt");

-- AddForeignKey
ALTER TABLE "lesson_question" ADD CONSTRAINT "lesson_question_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_question" ADD CONSTRAINT "lesson_question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_answer" ADD CONSTRAINT "lesson_answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "lesson_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_answer" ADD CONSTRAINT "lesson_answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
