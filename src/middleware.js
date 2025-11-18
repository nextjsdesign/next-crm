import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
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