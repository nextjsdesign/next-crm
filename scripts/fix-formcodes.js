import { prisma } from "../src/lib/prisma.js";

function generateFormCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; 5 > i; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function main() {
  const devices = await prisma.device.findMany();

  for (const d of devices) {
    if (!d.formCode) {
      let code = generateFormCode();

      // ensure unique
      let exists = await prisma.device.findUnique({
        where: { formCode: code },
      });

      while (exists) {
        code = generateFormCode();
        exists = await prisma.device.findUnique({
          where: { formCode: code },
        });
      }

      await prisma.device.update({
        where: { id: d.id },
        data: { formCode: code },
      });

      console.log(`✔ Added code ${code} to device ${d.id}`);
    }
  }

  console.log("All formCodes updated.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });