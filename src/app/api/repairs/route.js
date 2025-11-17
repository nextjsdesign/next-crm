import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/*
|--------------------------------------------------------------------------
| GET — Returnează fișa de reparație pentru un device
|        Dacă nu există, o creează automat
|--------------------------------------------------------------------------
*/
export async function GET(req) {
  try {
    const deviceId = req.nextUrl.searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId lipsă" }, { status: 400 });
    }

    // 1️⃣ Căutăm fișa
    let repair = await prisma.repair.findFirst({
      where: { deviceId },
      include: {
        items: true,
        historyNotes: { include: { user: true } },
        assignedTechnician: true,
      },
    });

    // 2️⃣ Dacă nu există — o creăm automat
    if (!repair) {
      repair = await prisma.repair.create({
        data: {
          deviceId,
          status: "În lucru",
          diagnostic: "",
          notes: "",
          assignedTechnicianId: null,
        },
        include: {
          items: true,
          historyNotes: { include: { user: true } },
          assignedTechnician: true,
        },
      });
    }

    return NextResponse.json({ repair });
  } catch (e) {
    console.error("GET /api/repairs ERROR:", e);
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}

/*
|--------------------------------------------------------------------------
| POST — Creează o fișă (de obicei nu e nevoie, dar o păstrăm)
|--------------------------------------------------------------------------
*/
export async function POST(req) {
  try {
    const { deviceId, status, diagnostic, notes, items } = await req.json();

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId lipsă" }, { status: 400 });
    }

    const repair = await prisma.repair.create({
      data: {
        deviceId,
        status: status || "În lucru",
        diagnostic: diagnostic || "",
        notes: notes || "",
        items: {
          create: items?.map((i) => ({
            kind: i.kind,
            label: i.label,
            qty: i.qty || 1,
            unitPrice: i.unitPrice || 0,
          })) || [],
        },
      },
      include: {
        items: true,
        historyNotes: true,
      },
    });

    return NextResponse.json({ repair });
  } catch (e) {
    console.error("POST /api/repairs ERROR:", e);
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}

/*
|--------------------------------------------------------------------------
| PUT — Actualizează fișa + items
|--------------------------------------------------------------------------
*/
export async function PUT(req) {
  try {
    const { id, deviceId, status, diagnostic, notes, items } =
      await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID fișă lipsă (repair.id)" },
        { status: 400 }
      );
    }

    // 1️⃣ Ștergem itemele vechi
    await prisma.repairItem.deleteMany({ where: { repairId: id } });

    // 2️⃣ Actualizăm fișa
    const updated = await prisma.repair.update({
      where: { id },
      data: {
        status,
        diagnostic,
        notes,
        items: {
          create: items?.map((i) => ({
            kind: i.kind,
            label: i.label,
            qty: i.qty || 1,
            unitPrice: i.unitPrice || 0,
          })) || [],
        },
      },
      include: {
        items: true,
        historyNotes: true,
      },
    });

    return NextResponse.json({ repair: updated });
  } catch (e) {
    console.error("PUT /api/repairs ERROR:", e);
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}