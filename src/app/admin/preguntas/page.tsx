import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { setQuestionHiddenAction } from "@/server/actions/qa";
import { formatDate } from "@/lib/format";
import { AnswerForm } from "@/components/player/qa-forms";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Preguntas" };

const FILTERS = { pendientes: "Sin responder", todas: "Todas", ocultas: "Ocultas" } as const;

export default async function AdminQuestions({ searchParams }: PageProps<"/admin/preguntas">) {
  const { filtro } = await searchParams;
  const f = typeof filtro === "string" && filtro in FILTERS ? (filtro as keyof typeof FILTERS) : "pendientes";
  const where =
    f === "pendientes"
      ? { hidden: false, answers: { none: { isStaff: true } } }
      : f === "ocultas"
        ? { hidden: true }
        : { hidden: false };
  const questions = await db.lessonQuestion.findMany({
    where,
    orderBy: { createdAt: f === "pendientes" ? "asc" : "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      lesson: { select: { id: true, title: true, module: { select: { course: { select: { slug: true, title: true } } } } } },
      answers: { orderBy: { createdAt: "asc" }, include: { user: { select: { name: true } } } },
    },
  });
  return (
    <>
      <PageHeader title="Preguntas y respuestas" description="Consultas de los alumnos en cada lección. Las respuestas del equipo se marcan como “Equipo académico” y se avisan por correo." />
      <div className="mb-4 flex gap-2 text-sm">
        {Object.entries(FILTERS).map(([k, label]) => (
          <Link
            key={k}
            href={`?filtro=${k}`}
            className={cn("rounded-full border px-3 py-1", f === k ? "border-ink-900 bg-ink-900 text-white" : "border-ink-300 bg-white")}
          >
            {label}
          </Link>
        ))}
      </div>
      {questions.length === 0 ? (
        <EmptyState title={f === "pendientes" ? "No hay preguntas pendientes" : "No hay preguntas"} />
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const course = q.lesson.module.course;
            return (
              <Card key={q.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-ink-500">
                      <Link href={`/cursos/${course.slug}/leccion/${q.lesson.id}?tab=preguntas`} className="font-semibold text-brand-700 hover:underline">
                        {course.title} › {q.lesson.title}
                      </Link>
                    </p>
                    <h2 className="mt-1 font-bold">{q.title}</h2>
                    <p className="mt-1 whitespace-pre-line text-sm text-ink-700">{q.body}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {q.user.name} ({q.user.email}) · {formatDate(q.createdAt)}
                    </p>
                  </div>
                  <form action={setQuestionHiddenAction}>
                    <input type="hidden" name="id" value={q.id} />
                    <input type="hidden" name="hidden" value={q.hidden ? "0" : "1"} />
                    <button className="text-xs font-semibold text-ink-600 hover:underline">{q.hidden ? "Volver a mostrar" : "Ocultar"}</button>
                  </form>
                </div>
                {q.answers.length > 0 && (
                  <div className="mt-3 space-y-2 border-l-2 border-ink-200 pl-4">
                    {q.answers.map((a) => (
                      <div key={a.id} className="text-sm">
                        <p className="text-xs text-ink-500">
                          <span className="font-semibold text-ink-900">{a.user.name}</span>
                          {a.isStaff && <Badge tone="brand" className="ml-2">Equipo académico</Badge>} · {formatDate(a.createdAt)}
                        </p>
                        <p className="whitespace-pre-line text-ink-800">{a.body}</p>
                      </div>
                    ))}
                  </div>
                )}
                {!q.hidden && (
                  <div className="mt-4">
                    <AnswerForm questionId={q.id} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
