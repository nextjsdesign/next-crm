export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthPath = pathname.startsWith("/api/auth");
  const isPublicPath = pathname === "/login" || pathname.startsWith("/_next");

  // ✅ Lasă pagina de login și NextAuth să treacă
  if (isAuthPath || isPublicPath) {
    return NextResponse.next();
  }

  // 🔒 Dacă nu e logat, redirect la /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};