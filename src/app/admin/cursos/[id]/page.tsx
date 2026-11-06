import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp, ExternalLink, PlayCircle, Trash2 } from "lucide-react";
import { courseFormOptions, getCourseForAdmin } from "@/server/queries/admin";
import { deleteCourseAction, deleteLessonAction, deleteModuleAction, moveItemAction } from "@/server/actions/admin";
import { watchUrl } from "@/lib/domain/video";
import { CourseForm, LessonForm, ModuleForm, QuizSettingsForm } from "@/components/admin/course-forms";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Alert, Badge, Card, PageHeader } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Editar curso" };

function MoveButtons({ model, id, first, last }: { model: string; id: string; first: boolean; last: boolean }) {
  return (
    <div className="flex">
      {(["up", "down"] as const).map((dir) => (
        <form key={dir} action={moveItemAction}>
          <input type="hidden" name="model" value={model} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="dir" value={dir} />
          <button
            className="rounded p-1 text-ink-500 hover:bg-ink-100 disabled:opacity-30"
            disabled={dir === "up" ? first : last}
            aria-label={dir === "up" ? "Subir" : "Bajar"}
          >
            {dir === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </button>
        </form>
      ))}
    </div>
  );
}

export default async function EditCourse({ params, searchParams }: PageProps<"/admin/cursos/[id]">) {
  const { id } = await params;
  const { creado } = await searchParams;
  const [course, opts] = await Promise.all([getCourseForAdmin(id), courseFormOptions()]);
  if (!course) notFound();
  const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const finalQuizzes = course.quizzes.filter((q) => !q.moduleId);

  return (
    <>
      <PageHeader
        title={course.title}
        description={`${course._count.enrollments} inscritos · ${course._count.certificates} certificados emitidos`}
        actions={
          <>
            <ButtonLink href={`/cursos/${course.slug}`} variant="outline" target="_blank">
              <ExternalLink className="h-4 w-4" aria-hidden /> Ver en el sitio
            </ButtonLink>
            <form action={deleteCourseAction}>
              <input type="hidden" name="id" value={course.id} />
              <ConfirmButton
                message={course._count.enrollments ? "El curso tiene alumnos: se archivará en lugar de eliminarse. ¿Continuar?" : "¿Eliminar el curso definitivamente?"}
                className="text-red-700"
              >
                <Trash2 className="h-4 w-4" aria-hidden /> {course._count.enrollments ? "Archivar" : "Eliminar"}
              </ConfirmButton>
            </form>
          </>
        }
      />
      {creado && <Alert tone="success" className="mb-4">Curso creado. Ahora agregue módulos, lecciones y la evaluación final.</Alert>}
      {course.status === "PUBLISHED" && (lessonCount === 0 || finalQuizzes.length === 0) && (
        <Alert className="mb-4">
          El curso está publicado pero {lessonCount === 0 ? "no tiene lecciones" : "no tiene evaluación final"}.
          {lessonCount === 0 ? " Nadie podrá completarlo." : " Se certificará solo con ver las lecciones."}
        </Alert>
      )}

      <div className="space-y-8">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-bold">Datos del curso</h2>
          <CourseForm
            {...opts}
            course={{
              ...course,
              sponsorIds: course.sponsors.map((s) => s.id),
              sheetIds: course.technicalSheets.map((s) => s.id),
            }}
          />
        </Card>

        <Card className="p-6">
          <h2 className="mb-1 text-lg font-bold">Módulos y lecciones</h2>
          <p className="mb-4 text-sm text-ink-600">{lessonCount} lecciones en {course.modules.length} módulos.</p>
          <div className="space-y-4">
            {course.modules.map((m, mi) => (
              <div key={m.id} className="rounded-lg border border-ink-200 bg-ink-50 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink-500">Módulo {mi + 1}</span>
                  <div className="min-w-60 flex-1">
                    <ModuleForm courseId={course.id} module={m} />
                  </div>
                  <MoveButtons model="module" id={m.id} first={mi === 0} last={mi === course.modules.length - 1} />
                  <form action={deleteModuleAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton message="¿Eliminar el módulo y todas sus lecciones? Se perderá el progreso de los alumnos en ellas." aria-label="Eliminar módulo">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </ConfirmButton>
                  </form>
                </div>
                <ul className="space-y-2">
                  {m.lessons.map((l, li) => (
                    <li key={l.id} className="rounded-md border border-ink-200 bg-white">
                      <details>
                        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm">
                          <PlayCircle className="h-4 w-4 text-ink-400" aria-hidden />
                          <span className="flex-1 font-medium">{l.title}</span>
                          {l.isPreview && <Badge tone="info">Muestra</Badge>}
                          <span className="text-xs text-ink-500">{l.durationMinutes} min</span>
                          <span className="text-xs text-brand-700">Editar</span>
                        </summary>
                        <div className="border-t border-ink-200 p-4">
                          <LessonForm
                            moduleId={m.id}
                            lesson={{ ...l, videoUrl: watchUrl({ provider: l.videoProvider, id: l.videoId, hash: l.videoHash ?? undefined }) }}
                          />
                          <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
                            <MoveButtons model="lesson" id={l.id} first={li === 0} last={li === m.lessons.length - 1} />
                            <form action={deleteLessonAction}>
                              <input type="hidden" name="id" value={l.id} />
                              <ConfirmButton message="¿Eliminar esta lección?" className="text-red-700">
                                <Trash2 className="h-4 w-4" aria-hidden /> Eliminar lección
                              </ConfirmButton>
                            </form>
                          </div>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-brand-700">+ Agregar lección</summary>
                  <div className="mt-3 rounded-md border border-ink-200 bg-white p-4">
                    <LessonForm moduleId={m.id} />
                  </div>
                </details>
              </div>
            ))}
            <div className="rounded-lg border border-dashed border-ink-300 p-4">
              <ModuleForm courseId={course.id} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-bold">Evaluaciones</h2>
          {course.quizzes.length > 0 && (
            <ul className="mb-6 divide-y divide-ink-100 rounded-md border border-ink-200">
              {course.quizzes.map((q) => (
                <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <div>
                    <Link href={`/admin/cursos/${course.id}/evaluaciones/${q.id}`} className="font-medium hover:text-brand-700">
                      {q.title}
                    </Link>
                    <p className="text-xs text-ink-500">
                      {q.module ? `Repaso: ${q.module.title}` : "Evaluación final"} · {q._count.questions} preguntas · mínimo {q.passingScore}% ·{" "}
                      {q.required ? "obligatoria" : "opcional"} · {q._count.attempts} intentos
                    </p>
                  </div>
                  {q._count.questions === 0 && <Badge tone="warning">Sin preguntas</Badge>}
                  <ButtonLink href={`/admin/cursos/${course.id}/evaluaciones/${q.id}`} size="sm" variant="outline">
                    Editar preguntas
                  </ButtonLink>
                </li>
              ))}
            </ul>
          )}
          <details open={course.quizzes.length === 0}>
            <summary className="cursor-pointer text-sm font-medium text-brand-700">+ Nueva evaluación</summary>
            <div className="mt-3">
              <QuizSettingsForm courseId={course.id} modules={course.modules.map((m) => ({ id: m.id, name: m.title }))} />
            </div>
          </details>
        </Card>
      </div>
    </>
  );
}
