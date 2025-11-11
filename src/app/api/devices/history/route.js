import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 🔹 GET — Returnează istoricul dispozitivelor unui client + status garanție
 * Exemplu apel: /api/devices/history?clientId=66be123f7a8c9e9a4f11e678
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    // ✅ verificare parametru
    if (!clientId) {
      return NextResponse.json(
        { error: "Lipsește clientId în query string." },
        { status: 400 }
      );
    }

    // ✅ obținem ultimele 10 dispozitive ale clientului
    const devices = await prisma.device.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        brand: true,
        model: true,
        deviceType: true,
        serialNumber: true,
        status: true,
        createdAt: true,
        problem: true,
        deliveryDate: true,
        warranty: true,
        sheetType: true,
      },
    });

    if (!devices || devices.length === 0) {
      return NextResponse.json([]);
    }

    // 🔹 funcție mică pentru a extrage nr. de zile din textul "30 zile"
    const getWarrantyDays = (text) => {
      const match = text?.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };

    // 🧮 calculăm garanția rămasă
    const today = new Date();
    const result = devices.map((d) => {
      let warrantyStatus = "⚪ Fără informații despre garanție";

      if (d.deliveryDate && d.warranty) {
        const totalDays = getWarrantyDays(d.warranty);
        const diff =
          (today.getTime() - new Date(d.deliveryDate).getTime()) /
          (1000 * 60 * 60 * 24);
        const remaining = Math.max(0, totalDays - Math.floor(diff));

        warrantyStatus =
          remaining > 0
            ? `🟢 În garanție (${remaining} zile rămase)`
            : "🔴 Garanție expirată";
      }

      return {
        id: d.id,
        brand: d.brand,
        model: d.model,
        deviceType: d.deviceType,
        serialNumber: d.serialNumber,
        sheetType: d.sheetType || "Nouă",
        status: d.status,
        problem: d.problem,
        createdAt: d.createdAt,
        deliveryDate: d.deliveryDate,
        warranty: d.warranty,
        warrantyStatus,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Eroare GET /devices/history:", error);
    return NextResponse.json(
      { error: "Eroare la preluarea istoricului dispozitivelor." },
      { status: 500 }
    );
  }
}