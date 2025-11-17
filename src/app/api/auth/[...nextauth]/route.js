import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        console.log("🟡 Login attempt:", credentials.email);

        if (!credentials?.email || !credentials?.password) {
          throw new Error("DATE_INCOMPLETE");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("❌ User not found");
          throw new Error("USER_INEXISTENT");
        }

        if (!user.isActive) {
          console.log("⛔ Account disabled");
          throw new Error("ACCOUNT_DISABLED");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          console.log("❌ Wrong password");
          throw new Error("PAROLA_INCORECTA");
        }

        // ⭐ RESTRICȚIE ORE PENTRU TEHNICIENI — versiunea corectă
        if (user.role === "technician" && user.workHours) {
          try {
            const raw = user.workHours.replace(/\s+/g, ""); // eliminăm spațiile
            const [start, end] = raw.split("-");

            const toMinutes = (time) => {
              const parts = time.split(":");
              const h = parseInt(parts[0], 10);
              const m = parts[1] ? parseInt(parts[1], 10) : 0;
              return h * 60 + m;
            };

            // validăm formatul minimal
            if (!start || !end) {
              console.log("⚠️ Program invalid: lipsesc valorile");
            } else {
              const startMin = toMinutes(start);
              const endMin = toMinutes(end);

              if (isNaN(startMin) || isNaN(endMin)) {
                console.log("⚠️ Program invalid în DB:", user.workHours);
              } else {
                const now = new Date();
                const currentMin = now.getHours() * 60 + now.getMinutes();

                console.log(
                  `⏰ Current: ${currentMin} min | Allowed: ${startMin} - ${endMin} min`
                );

                if (currentMin < startMin || currentMin > endMin) {
                  console.log("⛔ ACCESS BLOCKED OUTSIDE PROGRAM");
                  throw new Error(`ACCES_BLOCAT_INTERVAL_${start}_${end}`);
                }
              }
            }
          } catch (err) {
            console.log("⚠️ Eroare procesare workHours:", err);
          }
        }

        console.log("✅ Login OK for:", user.email);

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
  },

  callbacks: {
    // JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // Session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },

    // 🚀 Redirect stabil
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };