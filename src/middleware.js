import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token && (!token.sessionExpiresAt || Date.now() < token.sessionExpiresAt),
  },
});

// ⚙️ Permitem PUBLIC:
// - /login
// - /api/auth/*
// - /track/*  ← aici e fixul
export const config = {
  matcher: [
    "/((?!api/auth|login|track).*)",
  ],
};