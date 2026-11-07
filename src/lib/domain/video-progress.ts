// Seguimiento del avance de videos embebidos (YouTube / Vimeo) mediante postMessage, sin scripts externos.
import type { VideoProvider } from "./video";

export const PLAYER_ORIGINS: Record<VideoProvider, readonly string[]> = {
  YOUTUBE: ["https://www.youtube-nocookie.com", "https://www.youtube.com"],
  VIMEO: ["https://player.vimeo.com"],
};

export type PlayerProgress = { currentTime: number; duration: number; ended: boolean };

/** Mensajes que hay que enviar al iframe para empezar a recibir el avance. */
export function subscribeMessages(provider: VideoProvider): string[] {
  if (provider === "YOUTUBE") return [JSON.stringify({ event: "listening", id: "acacons", channel: "widget" })];
  return [
    JSON.stringify({ method: "addEventListener", value: "timeupdate" }),
    JSON.stringify({ method: "addEventListener", value: "ended" }),
  ];
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null);

function toObject(data: unknown): Record<string, unknown> | null {
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
  return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
}

/**
 * Interpreta un mensaje del reproductor. Devuelve el avance conocido (campos que falten quedan en NaN)
 * o null si el mensaje no corresponde al proveedor/origen esperado.
 */
export function parsePlayerMessage(provider: VideoProvider, origin: string, data: unknown): Partial<PlayerProgress> | null {
  if (!PLAYER_ORIGINS[provider].includes(origin)) return null;
  const msg = toObject(data);
  if (!msg) return null;

  if (provider === "YOUTUBE") {
    if (msg.event === "onStateChange") return msg.info === 0 ? { ended: true } : null;
    if (msg.event === "infoDelivery" && msg.info && typeof msg.info === "object") {
      const info = msg.info as Record<string, unknown>;
      const out: Partial<PlayerProgress> = {};
      const t = num(info.currentTime);
      const d = num(info.duration);
      if (t !== null) out.currentTime = t;
      if (d !== null) out.duration = d;
      if (info.playerState === 0) out.ended = true;
      return Object.keys(out).length ? out : null;
    }
    return null;
  }

  // Vimeo
  if (msg.event === "ended") return { ended: true };
  if (msg.event === "timeupdate" && msg.data && typeof msg.data === "object") {
    const d = msg.data as Record<string, unknown>;
    const t = num(d.seconds);
    const dur = num(d.duration);
    return t !== null && dur !== null ? { currentTime: t, duration: dur } : null;
  }
  return null;
}

export const NEAR_END_RATIO = 0.9;
export const NEAR_END_SECONDS = 30;

/** "Casi al final": 90 % del video, o los últimos 30 s, o el video terminó. */
export function isNearEnd(p: Partial<PlayerProgress>): boolean {
  if (p.ended) return true;
  const { currentTime: t, duration: d } = p;
  if (typeof t !== "number" || typeof d !== "number" || !(d > 0) || !(t > 0)) return false;
  // En videos largos alcanzan los últimos 30 s (créditos, cierre); en cortos rige el 90 %.
  return t / d >= NEAR_END_RATIO || d - t <= Math.min(NEAR_END_SECONDS, d * (1 - NEAR_END_RATIO));
}
