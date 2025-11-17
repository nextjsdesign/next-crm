import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Lipsește deviceId" },
        { status: 400 }
      );
    }

    // 🔹 Luăm device + client + user + repairs
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        client: true,
        user: true,
        repairs: {
          include: {
            items: true,
            historyNotes: { include: { user: true } },
            assignedTechnician: true, // ⬅ tehnicianul asignat
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Fișa nu există" },
        { status: 404 }
      );
    }

    // 🔥 Fișa activă = ultima creată
    const activeRepair = device.repairs.length > 0 ? device.repairs[0] : null;

    // 🔍 Determinăm tehnicianul asignat
    let assignedUserId = null;
    let assignedUserName = null;

    if (activeRepair?.assignedTechnician) {
      assignedUserId = activeRepair.assignedTechnician.id;
      assignedUserName = activeRepair.assignedTechnician.name;
    }

    // 🟦 trimitem un răspuns clar pentru UI
    return NextResponse.json({
      device,
      activeRepair,
      assignedUserId,
      assignedUserName,
    });

  } catch (err) {
    console.error("❌ Eroare repair-init:", err);
    return NextResponse.json(
      { error: "Eroare server" },
      { status: 500 }
    );
  }
}