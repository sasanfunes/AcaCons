import { embedUrl } from "@/lib/domain/video";

export function VideoPlayer({ provider, videoId, hash, title }: { provider: "YOUTUBE" | "VIMEO"; videoId: string; hash?: string | null; title: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        src={embedUrl({ provider, id: videoId, hash: hash ?? undefined })}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
