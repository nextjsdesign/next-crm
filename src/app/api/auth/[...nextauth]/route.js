import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        console.log("🟡 Autentificare pentru:", credentials.email);

        if (!credentials?.email || !credentials?.password) {
          throw new Error("DATE_INCOMPLETE");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("❌ Utilizator inexistent");
          throw new Error("USER_INEXISTENT");
        }

        // 🚫 Cont dezactivat → blocăm logarea
        if (!user.isActive) {
        console.log("⛔ Cont dezactivat!");
        throw new Error("ACCOUNT_DISABLED");
        }
        
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          console.log("❌ Parolă incorectă");
          throw new Error("PAROLA_INCORECTA");
        }

        // 🔒 RESTRICȚIE ORE — DOAR TEHNICIENI
        if (user.role === "technician" && user.workHours) {
          const [start, end] = user.workHours.split("-");

          const now = new Date();
          const current = `${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;

          console.log("⏰ Ora curentă:", current, "Program setat:", start, "-", end);

          // verificare interval
          if (current < start || current > end) {
            console.log("⛔ ACCES BLOCAT în afara intervalului");

            // ✨ AICI TRIMIT MESAJUL SPECIAL
            throw new Error(`ACCES_BLOCATI_${start}_${end}`);
          }
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

  pages: { signIn: "/login" },

  session: {
    strategy: "jwt",
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
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };