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

    // verificăm device-ul
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        repairs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Fișa de service nu există." },
        { status: 404 }
      );
    }

    // luăm fișa activă (ultima creată)
    let activeRepair = device.repairs[0];

    // dacă NU există repair → îl creăm acum
    if (!activeRepair) {
      activeRepair = await prisma.repair.create({
        data: {
          deviceId,
          assignedTechnicianId: userId,  // 🔥 SETĂM AICI TEHNICIANUL
          takenAt: new Date(),
        },
      });
    } else {
      // dacă există → actualizăm tehnicianul
      activeRepair = await prisma.repair.update({
        where: { id: activeRepair.id },
        data: {
          assignedTechnicianId: userId,   // 🔥 AICI ESTE CHEIA PROBLEMEI
          takenAt: new Date(),
        },
      });
    }

    // actualizăm și device-ul (nu elimin, poate îți folosește la alte părți)
    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: {
        userId: userId,
        technician: userName || "Tehnician",
      },
      include: {
        client: true,
        user: true,
      },
    });

    return NextResponse.json({
      device: updatedDevice,
      activeRepair,
      assignedUserId: activeRepair.assignedTechnicianId,
      assignedUserName: userName,
    });
  } catch (error) {
    console.error("❌ EROARE POST /api/devices/claim:", error);
    return NextResponse.json(
      { error: "Eroare la preluarea fișei." },
      { status: 500 }
    );
  }
}