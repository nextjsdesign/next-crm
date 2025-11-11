import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@crm.ro";
  const newPassword = "123456";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("❌ Nu există utilizatorul admin@crm.ro");
    return;
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  console.log("✅ Parola admin a fost resetată cu succes!");
  console.log("Email:", email);
  console.log("Noua parolă:", newPassword);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());