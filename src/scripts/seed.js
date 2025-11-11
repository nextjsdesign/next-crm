import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const hashed = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@crm.ro" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@crm.ro",
      password: hashed,
      role: "admin",
    },
  });

  console.log("✅ User creat:", user);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });