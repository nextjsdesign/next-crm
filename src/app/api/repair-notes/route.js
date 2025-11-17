import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper pentru notificări
async function sendNotification(userId, message, deviceId, repairId) {
  if (!userId) return;
  return prisma.notification.create({
    data: {
      userId,
      type: "note-added",
      message,
      deviceId,
      repairId,
    },
  });
}

export async function GET(req) {
  try {
    const repairId = req.nextUrl.searchParams.get("repairId");

    if (!repairId) return NextResponse.json({ notes: [] });

    const notes = await prisma.repairNote.findMany({
      where: { repairId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ notes });
  } catch (e) {
    console.error("GET /api/repair-notes ERROR:", e);
    return NextResponse.json({ notes: [] });
  }
}

export async function POST(req) {
  try {
    const { repairId, userId, message } = await req.json();

    if (!repairId || !userId || !message)
      return NextResponse.json({ error: "Date lipsă" }, { status: 400 });

    // =======================================================
    // FETCH Repair + Device
    // =======================================================
    const repair = await prisma.repair.findUnique({
      where: { id: repairId },
      include: { device: true },
    });

    if (!repair)
      return NextResponse.json(
        { error: "Fișa de reparație nu există" },
        { status: 404 }
      );

    const author = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!author)
      return NextResponse.json(
        { error: "User inexistent" },
        { status: 400 }
      );

    const deviceId = repair.deviceId;

    // =======================================================
    // 1) SINCRONIZARE assignedTechnicianId cu device.userId
    // =======================================================
    if (!repair.assignedTechnicianId && repair.device?.userId) {
      await prisma.repair.update({
        where: { id: repairId },
        data: { assignedTechnicianId: repair.device.userId },
      });

      repair.assignedTechnicianId = repair.device.userId;
    }

    // =======================================================
    // 2) Creăm nota
    // =======================================================
    const note = await prisma.repairNote.create({
      data: {
        repairId,
        userId,
        message,
      },
      include: { user: true },
    });

    // =======================================================
    // 3) LOGICA COMPLETĂ A NOTIFICĂRILOR
    // =======================================================

    // Dacă există tehnician asignat:
    if (repair.assignedTechnicianId) {
      const assignedId = repair.assignedTechnicianId;

      // Notificăm tehnicianul ASIGNAT dacă NU el scrie nota
      if (assignedId !== userId) {
        await sendNotification(
          assignedId,
          `${author.name} a scris o notă în fișa #${deviceId}`,
          deviceId,
          repairId
        );
      }

      // Notificăm adminii doar dacă autorul NU este admin
      if (author.role !== "admin") {
        const admins = await prisma.user.findMany({
          where: { role: "admin" },
        });

        for (const admin of admins) {
          if (admin.id !== userId) {
            await sendNotification(
              admin.id,
              `${author.name} a scris o notă în fișa #${deviceId}`,
              deviceId,
              repairId
            );
          }
        }
      }
    }

    // Dacă NU există tehnician asignat:
    else {
      // toți tehnicienii (mai puțin autorul)
      const techs = await prisma.user.findMany({
        where: { role: "technician" },
      });

      for (const t of techs) {
        if (t.id !== userId) {
          await sendNotification(
            t.id,
            `${author.name} a scris o notă în fișa #${deviceId}`,
            deviceId,
            repairId
          );
        }
      }

      // toți adminii (mai puțin autorul)
      const admins = await prisma.user.findMany({
        where: { role: "admin" },
      });

      for (const admin of admins) {
        if (admin.id !== userId) {
          await sendNotification(
            admin.id,
            `${author.name} a scris o notă în fișa #${deviceId}`,
            deviceId,
            repairId
          );
        }
      }
    }

    // =======================================================
    // Returnăm nota ca JSON valid
    // =======================================================
    return NextResponse.json({ note });
  } catch (e) {
    console.error("POST /api/repair-notes ERROR:", e);
    return NextResponse.json(
      { error: "Eroare server" },
      { status: 500 }
    );
  }
}