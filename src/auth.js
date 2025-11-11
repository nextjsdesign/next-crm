import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

let prisma;

async function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient();
  }
  return prisma;
}

export const auth = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const prisma = await getPrisma();
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) throw new Error("Utilizator inexistent");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Parolă incorectă");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});