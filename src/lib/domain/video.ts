export type VideoProvider = "YOUTUBE" | "VIMEO";
export type ParsedVideo = { provider: VideoProvider; id: string; hash?: string };

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/** Interpreta una URL de YouTube o Vimeo y devuelve proveedor + id (o null si no es válida). */
export function parseVideoUrl(input: string): ParsedVideo | null {
  const raw = input.trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, "").toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    return ytResult(parts[0]);
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "music.youtube.com") {
    if (parts[0] === "watch") return ytResult(url.searchParams.get("v") ?? undefined);
    if (["embed", "shorts", "live", "v"].includes(parts[0] ?? "")) return ytResult(parts[1]);
    return null;
  }
  if (host === "vimeo.com") {
    // vimeo.com/ID, vimeo.com/ID/HASH, vimeo.com/channels/x/ID, vimeo.com/showcase/x/video/ID
    const idx = parts.findIndex((p) => /^\d+$/.test(p));
    if (idx === -1) return null;
    const id = parts[idx]!;
    const next = parts[idx + 1];
    const hash = next && /^[a-f0-9]{6,}$/i.test(next) ? next : (url.searchParams.get("h") ?? undefined);
    return hash ? { provider: "VIMEO", id, hash } : { provider: "VIMEO", id };
  }
  if (host === "player.vimeo.com" && parts[0] === "video" && /^\d+$/.test(parts[1] ?? "")) {
    const hash = url.searchParams.get("h") ?? undefined;
    return hash ? { provider: "VIMEO", id: parts[1]!, hash } : { provider: "VIMEO", id: parts[1]! };
  }
  return null;
}

function ytResult(id: string | undefined): ParsedVideo | null {
  return id && YT_ID.test(id) ? { provider: "YOUTUBE", id } : null;
}

/**
 * URL para el iframe embebido. YouTube usa el dominio de privacidad mejorada.
 * Con `jsApiOrigin`, YouTube habilita su API por postMessage (necesaria para seguir el avance del video).
 */
export function embedUrl(v: ParsedVideo, opts: { jsApiOrigin?: string } = {}): string {
  if (v.provider === "YOUTUBE") {
    const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
    if (opts.jsApiOrigin) {
      params.set("enablejsapi", "1");
      params.set("origin", opts.jsApiOrigin);
    }
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?${params}`;
  }
  const params = new URLSearchParams({ dnt: "1" });
  if (v.hash) params.set("h", v.hash);
  return `https://player.vimeo.com/video/${encodeURIComponent(v.id)}?${params}`;
}

/** URL "canónica" para mostrar en el admin. */
export function watchUrl(v: ParsedVideo): string {
  if (v.provider === "YOUTUBE") return `https://www.youtube.com/watch?v=${v.id}`;
  return v.hash ? `https://vimeo.com/${v.id}/${v.hash}` : `https://vimeo.com/${v.id}`;
}
