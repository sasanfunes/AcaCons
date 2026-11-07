import { describe, expect, it } from "vitest";
import { isNearEnd, parsePlayerMessage, subscribeMessages } from "@/lib/domain/video-progress";
import { embedUrl } from "@/lib/domain/video";

const YT = "https://www.youtube-nocookie.com";
const VM = "https://player.vimeo.com";

describe("parsePlayerMessage", () => {
  it("YouTube infoDelivery en string JSON", () => {
    const data = JSON.stringify({ event: "infoDelivery", info: { currentTime: 95.5, duration: 100 } });
    expect(parsePlayerMessage("YOUTUBE", YT, data)).toEqual({ currentTime: 95.5, duration: 100 });
  });
  it("YouTube estado terminado", () => {
    expect(parsePlayerMessage("YOUTUBE", YT, { event: "onStateChange", info: 0 })).toEqual({ ended: true });
    expect(parsePlayerMessage("YOUTUBE", YT, { event: "infoDelivery", info: { playerState: 0 } })).toEqual({ ended: true });
    expect(parsePlayerMessage("YOUTUBE", YT, { event: "onStateChange", info: 1 })).toBeNull();
  });
  it("YouTube infoDelivery solo con duración", () => {
    expect(parsePlayerMessage("YOUTUBE", YT, { event: "infoDelivery", info: { duration: 300 } })).toEqual({ duration: 300 });
  });
  it("Vimeo timeupdate y ended", () => {
    const data = JSON.stringify({ event: "timeupdate", data: { seconds: 50, duration: 60, percent: 0.83 } });
    expect(parsePlayerMessage("VIMEO", VM, data)).toEqual({ currentTime: 50, duration: 60 });
    expect(parsePlayerMessage("VIMEO", VM, { event: "ended", data: {} })).toEqual({ ended: true });
  });
  it("rechaza orígenes ajenos y mensajes inválidos", () => {
    const data = { event: "infoDelivery", info: { currentTime: 99, duration: 100 } };
    expect(parsePlayerMessage("YOUTUBE", "https://evil.example", data)).toBeNull();
    expect(parsePlayerMessage("VIMEO", YT, { event: "ended" })).toBeNull();
    expect(parsePlayerMessage("YOUTUBE", YT, "no es json")).toBeNull();
    expect(parsePlayerMessage("YOUTUBE", YT, null)).toBeNull();
  });
});

describe("isNearEnd", () => {
  it("90 % del video largo", () => {
    expect(isNearEnd({ currentTime: 899, duration: 1000 })).toBe(false);
    expect(isNearEnd({ currentTime: 900, duration: 1000 })).toBe(true);
  });
  it("últimos 30 s en videos largos", () => {
    expect(isNearEnd({ currentTime: 3570, duration: 3600 })).toBe(true);
    expect(isNearEnd({ currentTime: 3000, duration: 3600 })).toBe(false);
  });
  it("en videos cortos no marca al principio", () => {
    expect(isNearEnd({ currentTime: 5, duration: 40 })).toBe(false);
    expect(isNearEnd({ currentTime: 36, duration: 40 })).toBe(true);
  });
  it("fin, duración desconocida o cero", () => {
    expect(isNearEnd({ ended: true })).toBe(true);
    expect(isNearEnd({ currentTime: 10, duration: 0 })).toBe(false);
    expect(isNearEnd({ currentTime: 10 })).toBe(false);
    expect(isNearEnd({ currentTime: 0, duration: 100 })).toBe(false);
  });
});

describe("embedUrl con API", () => {
  it("YouTube agrega enablejsapi y origin", () => {
    const url = new URL(embedUrl({ provider: "YOUTUBE", id: "aqz-KE-bpKQ" }, { jsApiOrigin: "https://academia.hn" }));
    expect(url.searchParams.get("enablejsapi")).toBe("1");
    expect(url.searchParams.get("origin")).toBe("https://academia.hn");
  });
  it("sin opción no habilita la API", () => {
    expect(embedUrl({ provider: "YOUTUBE", id: "aqz-KE-bpKQ" })).not.toContain("enablejsapi");
  });
  it("mensajes de suscripción", () => {
    expect(subscribeMessages("YOUTUBE")[0]).toContain('"listening"');
    expect(subscribeMessages("VIMEO")).toHaveLength(2);
  });
});

describe("isNearEnd en videos de 1 minuto", () => {
  it("no marca a la mitad", () => {
    expect(isNearEnd({ currentTime: 30, duration: 60 })).toBe(false);
    expect(isNearEnd({ currentTime: 54, duration: 60 })).toBe(true);
  });
});
