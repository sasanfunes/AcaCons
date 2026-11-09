import type { NextConfig } from "next";

// HTTPS estricto cuando el sitio se publica con HTTPS (Vercel o APP_URL https). En localhost por HTTP no aplica.
const httpsOnly = !!process.env.VERCEL || (process.env.APP_URL ?? "").startsWith("https://");

// Política de seguridad: solo se permiten iframes de YouTube (modo privacidad) y Vimeo.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
  "connect-src 'self'" + (process.env.NODE_ENV === "development" ? " ws:" : ""),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(httpsOnly ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  // Fuentes y logo que lee el generador de certificados en tiempo de ejecución (Vercel).
  outputFileTracingIncludes: {
    "/api/certificados/[code]/pdf": ["./src/lib/pdf/fonts/**", "./public/brand/logo.png"],
  },
  experimental: {
    serverActions: { bodySizeLimit: "25mb" },
    authInterrupts: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(httpsOnly ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
