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
    // 1) SINCRONIZARE dacă device.userId ≠ repair.assignedTechnicianId
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
    // 3) LOGICA FINALĂ DE NOTIFICĂRI (FĂRĂ DUBLURI)
    // =======================================================

    // Adunăm adminii o singură dată
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
    });

    if (repair.assignedTechnicianId) {
      //
      // 🔵 CAZ 1: EXISTĂ tehnician ASIGNAT
      //

      // 1️⃣ Notificăm tehnicianul asignat (dacă NU el a scris)
      if (repair.assignedTechnicianId !== userId) {
        await sendNotification(
          repair.assignedTechnicianId,
          `${author.name} a scris o notă în fișa #${deviceId}`,
          deviceId,
          repairId
        );
      }

      // 2️⃣ Notificăm ADMINII (fără autor și fără assignedTechnician ≠ autor)
      for (const admin of admins) {
        if (
          admin.id !== userId &&                 // nu notificăm autorul
          admin.id !== repair.assignedTechnicianId // ✨ STOP dublură: dacă adminul este assignedTech, NU notificăm iar
        ) {
          await sendNotification(
            admin.id,
            `${author.name} a scris o notă în fișa #${deviceId}`,
            deviceId,
            repairId
          );
        }
      }

    } else {
      //
      // 🔵 CAZ 2: NU există tehnician asignat
      //

      // notificăm toți tehnicienii (cu excepția autorului)
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

      // notificăm adminii (cu excepția autorului)
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
    // Returnăm nota
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