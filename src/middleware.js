import { withAuth } from "next-auth/middleware";

// 🔒 Middleware NextAuth — protejează tot site-ul
export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token, // ✅ true dacă userul e logat
  },
});

// ⚙️ Rute protejate — toate, în afară de /login și /api/auth
export const config = {
  matcher: [
    "/((?!api/auth|login).*)", // ⛔ totul e protejat, exceptând login + autentificare NextAuth
  ],
};