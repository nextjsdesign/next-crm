import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@crm.ro";
  const plainPassword = "123456";

  // verificăm dacă deja există userul
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("ℹ️  Utilizatorul admin există deja:", existing.email);
    return;
  }

  // generăm hash bcrypt
  const hashed = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.create({
    data: {
      name: "Administrator",
      email,
      password: hashed,
      role: "admin",
    },
  });

  console.log("✅ Utilizator admin creat cu succes:");
  console.log("Email:", user.email);
  console.log("Parolă:", plainPassword);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());