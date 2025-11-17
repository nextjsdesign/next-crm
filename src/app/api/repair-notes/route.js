import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** ------------------------------------------------------------------
 *  GET  - Returnează toate notele pentru un repairId
 * ------------------------------------------------------------------*/
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const repairId = searchParams.get("repairId");

    if (!repairId) {
      return NextResponse.json({ notes: [] });
    }

    const notes = await prisma.repairNote.findMany({
      where: { repairId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ notes });
  } catch (err) {
    console.error("GET /repair-notes error:", err);
    return NextResponse.json(
      { error: "Eroare la încărcarea notelor." },
      { status: 500 }
    );
  }
}

/** ------------------------------------------------------------------
 *  POST - Adaugă o notă
 *  Dacă repairId NU există → creează automat un repair minim
 * ------------------------------------------------------------------*/
export async function POST(req) {
  try {
    const body = await req.json();
    let { repairId, deviceId, userId, message } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Userul nu este valid." },
        { status: 400 }
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Mesajul notei nu poate fi gol." },
        { status: 400 }
      );
    }

    // Dacă nu avem repairId → îi facem unul
    let repair = null;

    if (!repairId) {
      if (!deviceId) {
        return NextResponse.json(
          { error: "Lipsește deviceId pentru a crea automat fișa." },
          { status: 400 }
        );
      }

      // Căutăm un repair deja existent pentru device
      repair = await prisma.repair.findFirst({
        where: { deviceId },
      });

      // Dacă nu există → îl creăm automat
      if (!repair) {
        repair = await prisma.repair.create({
          data: {
            deviceId,
            status: "În lucru",
          },
        });
      }

      repairId = repair.id;
    }

    // Creăm nota
    const note = await prisma.repairNote.create({
      data: {
        repairId,
        userId,
        message: message.trim(),
      },
      include: { user: true },
    });

    return NextResponse.json({ note });
  } catch (err) {
    console.error("POST /repair-notes error:", err);
    return NextResponse.json(
      { error: "Eroare la adăugarea notei." },
      { status: 500 }
    );
  }
}