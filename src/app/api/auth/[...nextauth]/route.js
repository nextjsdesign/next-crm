import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "ex: admin@crm.ro" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🟡 Autentificare pentru:", credentials.email);

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Completează toate câmpurile.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("❌ Utilizator inexistent:", credentials.email);
          throw new Error("Utilizator inexistent.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          console.log("❌ Parolă incorectă pentru:", credentials.email);
          throw new Error("Parolă incorectă.");
        }

        console.log("✅ Login reușit pentru:", user.email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24h
  },

  secret: process.env.NEXTAUTH_SECRET,

  /**
   * 🧩 Config cookie adaptiv (funcționează și pe Vercel, și local)
   * - Local: next-auth.session-token (fără secure)
   * - Production: next-auth.session-token (fără prefix __Secure)
   *   deoarece uneori Vercel redirecționează http → https și pierde cookie-ul
   */
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", // doar pe HTTPS real
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  debug: true, // ✅ activ pentru testare (poți dezactiva după ce verificăm)
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };