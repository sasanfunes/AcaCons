"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Award, CheckCircle2, ChevronRight, X } from "lucide-react";
import { embedUrl } from "@/lib/domain/video";
import { isNearEnd, parsePlayerMessage, PLAYER_ORIGINS, subscribeMessages, type PlayerProgress } from "@/lib/domain/video-progress";
import { autoCompleteLessonAction, type AutoCompleteResult } from "@/server/actions/learning";

type Props = {
  provider: "YOUTUBE" | "VIMEO";
  videoId: string;
  hash?: string | null;
  title: string;
  /** Seguir el avance y marcar la lección al llegar casi al final (alumno inscrito y lección pendiente). */
  track?: boolean;
  lessonId?: string;
  origin?: string;
  nextHref?: string;
  nextLabel?: string;
};

export function VideoPlayer({ provider, videoId, hash, title, track = false, lessonId, origin, nextHref, nextLabel }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progress = useRef<Partial<PlayerProgress>>({});
  const fired = useRef(false);
  const [result, setResult] = useState<AutoCompleteResult | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  // La URL no depende de `track`: así el video no se recarga cuando la lección pasa a completada.
  const src = embedUrl({ provider, id: videoId, hash: hash ?? undefined }, origin ? { jsApiOrigin: origin } : {});

  const subscribe = () => {
    const win = iframeRef.current?.contentWindow;
    if (!track || !win) return;
    for (const m of subscribeMessages(provider)) {
      for (const target of PLAYER_ORIGINS[provider]) {
        try {
          win.postMessage(m, target);
        } catch {
          /* el iframe todavía no cargó ese origen */
        }
      }
    }
  };

  useEffect(() => {
    if (!track || !lessonId) return;
    fired.current = false;
    progress.current = {};
    const onMessage = (e: MessageEvent) => {
      if (fired.current || e.source !== iframeRef.current?.contentWindow) return;
      const update = parsePlayerMessage(provider, e.origin, e.data);
      if (!update) return;
      progress.current = { ...progress.current, ...update };
      if (!isNearEnd(progress.current)) return;
      fired.current = true;
      startTransition(async () => {
        const r = await autoCompleteLessonAction(lessonId);
        if (r.ok) {
          setResult(r);
          router.refresh();
        }
      });
    };
    window.addEventListener("message", onMessage);
    // YouTube necesita repetir "listening" hasta que el reproductor esté listo.
    const retry = window.setInterval(subscribe, 1500);
    const stop = window.setTimeout(() => window.clearInterval(retry), 15000);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(retry);
      window.clearTimeout(stop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, lessonId, provider, videoId]);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        onLoad={subscribe}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center px-4">
        {result?.ok && !dismissed && (
          <div className="pointer-events-auto flex max-w-xl flex-wrap items-center gap-3 rounded-md border-l-8 border-brand-500 bg-ink-900/95 px-4 py-3 text-sm text-white shadow-xl">
            {result.certificateCode ? (
              <>
                <Award className="h-5 w-5 text-brand-500" aria-hidden />
                <span className="font-semibold">¡Curso completado!</span>
                <Link
                  href={`/certificados/${result.certificateCode}`}
                  className="rounded-md bg-brand-500 px-3 py-1.5 font-semibold text-ink-900 hover:bg-brand-200"
                >
                  Ver mi certificado
                </Link>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-brand-500" aria-hidden />
                <span className="font-semibold">Lección completada</span>
                {nextHref && (
                  <Link
                    href={nextHref}
                    className="flex items-center gap-1 rounded-md bg-brand-500 px-3 py-1.5 font-semibold text-ink-900 hover:bg-brand-200"
                  >
                    {nextLabel ?? "Siguiente lección"} <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </>
            )}
            <button type="button" onClick={() => setDismissed(true)} aria-label="Cerrar aviso" className="ml-auto rounded p-1 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
