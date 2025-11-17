import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { deviceId, userId, userName } = body;

    if (!deviceId || !userId) {
      return NextResponse.json(
        { error: "Lipsește deviceId sau userId." },
        { status: 400 }
      );
    }

    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) {
      return NextResponse.json(
        { error: "Fișa de service nu există." },
        { status: 404 }
      );
    }

    // Dacă e deja preluată de altcineva, doar adminul ar trebui să poată reseta,
    // dar logica de rol o controlăm în componentă (canEdit / handleClaim)
    const updated = await prisma.device.update({
      where: { id: deviceId },
      data: {
        userId,
        technician: userName || "Tehnician",
      },
      include: {
        client: true,
        user: true,
        repairs: { include: { items: true } },
      },
    });

    return NextResponse.json({ device: updated });
  } catch (error) {
    console.error("❌ EROARE POST /api/devices/claim:", error);
    return NextResponse.json(
      { error: "Eroare la preluarea fișei." },
      { status: 500 }
    );
  }
}