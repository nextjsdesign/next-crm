import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/* -----------------------------------------------------------
   Funcție utilitară pentru notificări
------------------------------------------------------------ */
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

/* -----------------------------------------------------------
   GET – toate notele
------------------------------------------------------------ */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const repairId = searchParams.get("repairId");

    if (!repairId) return NextResponse.json({ notes: [] });

    const notes = await prisma.repairNote.findMany({
      where: { repairId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ notes });
  } catch (err) {
    console.error("GET /repair-notes error:", err);
    return NextResponse.json({ notes: [] });
  }
}

/* -----------------------------------------------------------
   POST – adaugă o notă + trimite notificări
------------------------------------------------------------ */
export async function POST(req) {
  try {
    const { repairId, deviceId, userId, message } = await req.json();

    if (!userId || !message?.trim()) {
      return NextResponse.json(
        { error: "Date insuficiente." },
        { status: 400 }
      );
    }

    // 1️⃣ Căutăm repair + device
    const repair = await prisma.repair.findUnique({
      where: { id: repairId },
      include: { device: true },
    });

    if (!repair) {
      return NextResponse.json(
        { error: "Fișa nu există." },
        { status: 404 }
      );
    }

    const device = repair.device;
    const deviceCode = device?.formCode || device?.id || deviceId || repairId;

    // Autorul notei
    const author = await prisma.user.findUnique({ where: { id: userId } });

    // 2️⃣ Salvăm nota
    const note = await prisma.repairNote.create({
      data: {
        repairId,
        userId,
        message: message.trim(),
      },
      include: { user: true },
    });

    /* ============================================================
      LOGICĂ NOTIFICĂRI EXACT CA ÎNAINTE
    ============================================================ */

    const assignedTech = repair.assignedTechnicianId;

    // ⚠️ FIȘA NU ESTE ASIGNATĂ
    if (!assignedTech) {
      // Notificăm TOȚI TEHNICIENII (mai puțin autorul)
      const techs = await prisma.user.findMany({
        where: { role: "technician" },
      });

      for (const t of techs) {
        if (t.id !== userId) {
          await sendNotification(
            t.id,
            `${author.name} a adăugat o notă la fișa #${deviceCode}`,
            deviceId,
            repairId
          );
        }
      }

      // notificăm adminii
      const admins = await prisma.user.findMany({
        where: { role: "admin" },
      });

      for (const admin of admins) {
        if (admin.id !== userId) {
          await sendNotification(
            admin.id,
            `${author.name} a adăugat o notă la fișa #${deviceCode}`,
            deviceId,
            repairId
          );
        }
      }
    }

    // ⚠️ FIȘA ESTE ASIGNATĂ
    else {
      // autorul este tehnicianul asignat
      if (assignedTech === userId) {
        // notificăm ADMINII
        const admins = await prisma.user.findMany({
          where: { role: "admin" },
        });

        for (const admin of admins) {
          if (admin.id !== userId) {
            await sendNotification(
              admin.id,
              `${author.name} a scris o notă în fișa #${deviceCode}`,
              deviceId,
              repairId
            );
          }
        }
      }

      // autorul este ADMIN
      else if (author.role === "admin") {
        await sendNotification(
          assignedTech,
          `Administratorul ${author.name} a scris o notă în fișa #${deviceCode}`,
          deviceId,
          repairId
        );
      }
    }

    return NextResponse.json({ note });
  } catch (err) {
    console.error("POST /repair-notes error:", err);
    return NextResponse.json(
      { error: "Eroare server." },
      { status: 500 }
    );
  }
}