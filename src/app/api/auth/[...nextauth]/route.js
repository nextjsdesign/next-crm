import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/prisma";
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
        console.log("🟡 Încearcă autentificarea pentru:", credentials.email);

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
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

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
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };