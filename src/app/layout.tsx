import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "La Academia del Constructor", template: "%s · La Academia del Constructor" },
  description:
    "Cursos, videos y eventos presenciales sobre materiales de construcción y sus aplicaciones en Honduras y Centroamérica.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-HN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
