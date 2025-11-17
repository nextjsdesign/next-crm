import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request) {
  try {
    const body = await request.json();
    const { deviceId, userId, userName } = body;

    if (!deviceId || !userId) {
      return NextResponse.json(
        { error: "Lipsește deviceId sau userId." },
        { status: 400 }
      );
    }

    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Fișa nu există." },
        { status: 404 }
      );
    }

    // actualizăm fișa de service
    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: {
        userId,
        technician: userName || "Tehnician",
      },
      include: {
        client: true,
        user: true,
      },
    });

    // actualizăm și ultimul Repair asociat (dacă există)
    const lastRepair = await prisma.repair.findFirst({
      where: { deviceId },
      orderBy: { createdAt: "desc" },
    });

    let updatedRepair = null;

    if (lastRepair) {
      updatedRepair = await prisma.repair.update({
        where: { id: lastRepair.id },
        data: {
          assignedTechnicianId: userId,
        },
      });
    }

    return NextResponse.json({
      device: updatedDevice,
      repair: updatedRepair,
    });
  } catch (err) {
    console.error("❌ EROARE ASSIGN:", err);
    return NextResponse.json(
      { error: "Eroare la reasignare." },
      { status: 500 }
    );
  }
}