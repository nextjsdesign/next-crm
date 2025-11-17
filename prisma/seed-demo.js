import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// === RANDOM DATA ===
const deviceTypes = ["Laptop", "Telefon", "Tabletă", "PC Gaming", "Smartwatch"];
const statuses = [
  "Primire",
  "Diagnosticare",
  "Așteaptă piese",
  "În lucru",
  "Finalizat",
  "Refuzat",
];
const laptopBrands = ["Dell", "HP", "Lenovo", "Asus", "Acer", "Apple"];
const phoneBrands = ["Apple", "Samsung", "Xiaomi", "Huawei", "OnePlus"];
const tabletBrands = ["Apple", "Samsung", "Lenovo", "Huawei"];
const pcBrands = ["Custom", "Lenovo", "Dell"];
const smartwatchBrands = ["Apple", "Samsung", "Huawei"];

const problemList = [
  "Nu pornește",
  "Ecran spart",
  "Baterie uzată",
  "Nu încarcă",
  "Rulează greu",
  "Se restartează",
  "Artefacte video",
  "Nu citește SSD",
  "Wifi nu funcționează",
  "Sunet distorsionat",
];

// === HELPER RANDOM ===
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randSerial = () =>
  "SN" + Math.random().toString(36).substring(2, 10).toUpperCase();
const randPhone = () =>
  "07" + Math.floor(10000000 + Math.random() * 90000000).toString();
const randName = () => {
  const first = ["Ion", "Marius", "Andrei", "Alex", "George", "Gabriel", "Cosmin", "Cristian", "Daniel", "Robert"];
  const last = ["Popescu", "Ionescu", "Marinescu", "Dumitrescu", "Stan", "Ilie", "Enache", "Zamfir", "Radu", "Barbu"];
  return `${rand(first)} ${rand(last)}`;
};

async function main() {
  console.log("🌱 Generăm 20 fișe service random…");

  // ==========================================
  // CREARE 20 DE CLIENȚI + DEVICE-URI
  // ==========================================
  for (let i = 0; i < 20; i++) {
    const clientName = randName();
    const deviceType = rand(deviceTypes);

    let brand;
    switch (deviceType) {
      case "Laptop": brand = rand(laptopBrands); break;
      case "Telefon": brand = rand(phoneBrands); break;
      case "Tabletă": brand = rand(tabletBrands); break;
      case "PC Gaming": brand = rand(pcBrands); break;
      case "Smartwatch": brand = rand(smartwatchBrands); break;
      default: brand = "Generic";
    }

    const model = "Model " + Math.floor(100 + Math.random() * 900);

    // Creează client
    const client = await prisma.client.create({
      data: {
        name: clientName,
        phone: randPhone(),
        email: clientName.toLowerCase().replace(" ", ".") + "@gmail.com",
        address: "Strada Exemplu nr. " + Math.floor(1 + Math.random() * 100),
      },
    });

    // Creează device
    await prisma.device.create({
      data: {
        clientId: client.id,
        sheetType: "Nouă",
        status: rand(statuses),
        deviceType,
        brand,
        model,
        serialNumber: randSerial(),
        problem: rand(problemList),
        description: "Clientul dorește diagnostic complet.",
        accessories: Math.random() > 0.5 ? "Încărcător" : "",
        priceEstimate: Math.floor(150 + Math.random() * 800),
        warranty: "30 zile",
      },
    });

    console.log(`➡ Creat #${i + 1}: ${clientName} — ${deviceType} ${brand} ${model}`);
  }

  console.log("🌱 SEED COMPLET — 20 fișe create.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });