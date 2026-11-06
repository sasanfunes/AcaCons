/* eslint-disable @next/next/no-img-element -- las portadas se sirven desde /api/files (SVG/PNG/JPG). */
import { ImageIcon } from "lucide-react";
import { fileUrl } from "@/lib/storage/url";
import { cn } from "@/lib/cn";

export function Cover({ fileKey, alt, className }: { fileKey: string | null | undefined; alt: string; className?: string }) {
  const src = fileUrl(fileKey);
  return (
    <div className={cn("relative aspect-video overflow-hidden bg-ink-200", className)}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full items-center justify-center text-ink-500">
          <ImageIcon className="h-8 w-8" aria-hidden />
        </div>
      )}
    </div>
  );
}

export function Logo({ fileKey, alt, className }: { fileKey: string | null | undefined; alt: string; className?: string }) {
  const src = fileUrl(fileKey);
  return src ? (
    <img src={src} alt={alt} className={cn("rounded-lg object-contain", className)} loading="lazy" />
  ) : (
    <div className={cn("flex items-center justify-center rounded-lg bg-ink-200 font-bold text-ink-600", className)}>{alt.slice(0, 2)}</div>
  );
}
