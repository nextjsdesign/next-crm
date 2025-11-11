export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // ✅ Permite accesul doar la paginile de login și NextAuth
  const isAuthPath =
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/login" ||
    pathname === "/favicon.ico";

  if (isAuthPath) {
    return NextResponse.next();
  }

  // 🔒 Dacă nu există token → redirecționează spre /login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ✅ Dacă e logat, continuă normal
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protejează toate rutele, cu excepția celor publice
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
};