import { describe, expect, it } from "vitest";
import { embedUrl, parseVideoUrl, watchUrl } from "@/lib/domain/video";

describe("parseVideoUrl", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s", "dQw4w9WgXcQ"],
    ["https://m.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?si=abc", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/live/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("YouTube %s", (url, id) => {
    expect(parseVideoUrl(url)).toEqual({ provider: "YOUTUBE", id });
  });

  it("Vimeo público", () => {
    expect(parseVideoUrl("https://vimeo.com/76979871")).toEqual({ provider: "VIMEO", id: "76979871" });
  });
  it("Vimeo privado con hash en la ruta", () => {
    expect(parseVideoUrl("https://vimeo.com/76979871/a1b2c3d4e5")).toEqual({
      provider: "VIMEO",
      id: "76979871",
      hash: "a1b2c3d4e5",
    });
  });
  it("Vimeo player con hash", () => {
    expect(parseVideoUrl("https://player.vimeo.com/video/76979871?h=a1b2c3d4e5&badge=0")).toEqual({
      provider: "VIMEO",
      id: "76979871",
      hash: "a1b2c3d4e5",
    });
  });
  it("Vimeo canal", () => {
    expect(parseVideoUrl("https://vimeo.com/channels/staffpicks/76979871")).toEqual({ provider: "VIMEO", id: "76979871" });
  });

  it.each(["", "hola", "https://example.com/watch?v=dQw4w9WgXcQ", "https://youtube.com/watch?v=corto", "https://vimeo.com/usuario"])(
    "rechaza %s",
    (url) => {
      expect(parseVideoUrl(url)).toBeNull();
    },
  );
});

describe("embedUrl / watchUrl", () => {
  it("YouTube usa youtube-nocookie", () => {
    expect(embedUrl({ provider: "YOUTUBE", id: "dQw4w9WgXcQ" })).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/);
  });
  it("Vimeo incluye el hash", () => {
    expect(embedUrl({ provider: "VIMEO", id: "1", hash: "abc123" })).toBe("https://player.vimeo.com/video/1?dnt=1&h=abc123");
  });
  it("watchUrl ida y vuelta", () => {
    const v = parseVideoUrl(watchUrl({ provider: "VIMEO", id: "76979871", hash: "a1b2c3d4e5" }));
    expect(v).toEqual({ provider: "VIMEO", id: "76979871", hash: "a1b2c3d4e5" });
  });
});
