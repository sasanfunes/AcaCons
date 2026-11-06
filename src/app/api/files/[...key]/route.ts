import { NextResponse } from "next/server";
import { CONTENT_TYPES, storage } from "@/lib/storage";

export async function GET(request: Request, ctx: RouteContext<"/api/files/[...key]">) {
  const { key: parts } = await ctx.params;
  const key = parts.join("/");
  const url = new URL(request.url);
  const downloadName = url.searchParams.get("nombre")?.replace(/[^\w.\- áéíóúñÁÉÍÓÚÑ]/g, "") || undefined;

  if (storage.signedUrl) {
    try {
      return NextResponse.redirect(await storage.signedUrl(key, downloadName), 302);
    } catch {
      return new NextResponse("No encontrado", { status: 404 });
    }
  }
  let file;
  try {
    file = await storage.get(key);
  } catch {
    file = null;
  }
  if (!file) return new NextResponse("No encontrado", { status: 404 });
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const headers: Record<string, string> = {
    "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  if (ext === "svg") headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  if (file.size) headers["Content-Length"] = String(file.size);
  if (downloadName) headers["Content-Disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`;
  return new NextResponse(file.stream, { headers });
}
