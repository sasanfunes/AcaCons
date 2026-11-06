import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Chequeo optimista: si no hay cookie de sesión, redirige al login.
// La autorización real (rol, pertenencia) se valida en el servidor con los guards.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/ingresar", request.url);
    url.searchParams.set("volver", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/mi-cuenta/:path*", "/admin/:path*"],
};
