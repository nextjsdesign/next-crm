import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Se creează userul admin...");

  const password = "admin123";
  const hashed = bcrypt.hashSync(password, 10);

  // Ştergem orice user existent cu același email (ca să ruleze de mai multe ori fără probleme)
  await prisma.user.deleteMany({
    where: { email: "admin@procomputer.ro" },
  });

  // Creăm adminul
  const user = await prisma.user.create({
    data: {
      name: "Administrator",
      email: "admin@procomputer.ro",
      password: hashed,
      role: "admin",
      isActive: true,
      workHours: "09:00-17:00"
    },
  });

  console.log("✅ Admin creat cu succes!");
  console.log("Email: admin@procomputer.ro");
  console.log("Parola: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });