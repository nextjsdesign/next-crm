import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ======================================================
   📌 GENERATOR COD UNIC FIȘĂ (ex: A7K2B)
====================================================== */
function generateFormCode(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/* ======================================================
   📌 GET — Toate fișele
====================================================== */
export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      // Only fields used by the dashboard and mobile cards.
      // In particular, never serialize the related user's password.
      select: {
        id: true,
        formCode: true,
        status: true,
        deviceType: true,
        brand: true,
        model: true,
        serialNumber: true,
        problem: true,
        description: true,
        technician: true,
        priceEstimate: true,
        createdAt: true,
        client: { select: { id: true, name: true, phone: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(devices);
  } catch (error) {
    console.error("❌ Eroare GET /devices:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ======================================================
   📌 POST — Creează fișă + GENEREAZĂ formCode
====================================================== */
export async function POST(request) {
  try {
    const data = await request.json();

    // căutăm client existent
    let client = await prisma.client.findFirst({
      where: {
        name: data.clientName,
        phone: data.phone || undefined,
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: data.clientName,
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
        },
      });
    }

    // device părinte
    let parentDevice = null;
    if (data.selectedDeviceId) {
      parentDevice = await prisma.device.findUnique({
        where: { id: data.selectedDeviceId },
      });
    }

    // 🔥 GENERĂM COD UNIC
    let formCode = generateFormCode();

    // verificăm să nu existe duplicat
    while (await prisma.device.findFirst({ where: { formCode } })) {
      formCode = generateFormCode();
    }

    const device = await prisma.device.create({
      data: {
        formCode, // 🔥 cod unic fișă

        clientId: client.id,
        parentDeviceId: data.selectedDeviceId || null,
        sheetType: data.sheetType || "Nouă",
        status: data.status || "Primire",

        deviceType: data.deviceType || parentDevice?.deviceType || "",
        brand: data.brand || parentDevice?.brand || "",
        model: data.model || parentDevice?.model || "",
        serialNumber: data.serialNumber || parentDevice?.serialNumber || "",

        problem: data.problem || "",
        accessories: data.accessories || "",
        description: data.description || "",
        technician: data.technician || "",
        priceEstimate: data.priceEstimate ? parseFloat(data.priceEstimate) : 0,
        advance: data.advance ? parseFloat(data.advance) : 0,
        warranty: data.warranty || null,
        priceConfirmed: data.priceConfirmed || false,
        liquidContact: data.liquidContact || false,
        deliveryDays: data.deliveryDays ? parseInt(data.deliveryDays) : null,
        notes: data.notes || "",
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,

        receptionCondition: data.receptionCondition || "",
        receptionNotes: data.receptionNotes || "",
      },
      include: { client: true },
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error("❌ Eroare POST /devices:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ======================================================
   📌 PUT — Actualizează fișă
====================================================== */
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, clientName, phone, email, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: "ID lipsă pentru actualizare." },
        { status: 400 }
      );
    }

    let client = await prisma.client.findFirst({
      where: {
        name: clientName,
        phone: phone || undefined,
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: { name: clientName, phone: phone || "", email: email || "" },
      });
    }

    const updatedDevice = await prisma.device.update({
      where: { id },
      data: {
        clientId: client.id,
        parentDeviceId: updateData.selectedDeviceId || null,
        sheetType: updateData.sheetType || "Nouă",
        status: updateData.status || "Primire",
        deviceType: updateData.deviceType || "",
        brand: updateData.brand || "",
        model: updateData.model || "",
        serialNumber: updateData.serialNumber || "",
        problem: updateData.problem || "",
        accessories: updateData.accessories || "",
        description: updateData.description || "",
        technician: updateData.technician || "",
        priceEstimate: updateData.priceEstimate ? parseFloat(updateData.priceEstimate) : 0,
        advance: updateData.advance ? parseFloat(updateData.advance) : 0,
        warranty: updateData.warranty || null,
        priceConfirmed: updateData.priceConfirmed || false,
        liquidContact: updateData.liquidContact || false,
        deliveryDays: updateData.deliveryDays ? parseInt(updateData.deliveryDays) : null,
        notes: updateData.notes || "",
        deliveryDate: updateData.deliveryDate ? new Date(updateData.deliveryDate) : null,
        receptionCondition: updateData.receptionCondition || "",
        receptionNotes: updateData.receptionNotes || "",
      },
      include: { client: true },
    });

    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error("❌ Eroare PUT /devices:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ======================================================
   📌 DELETE — Șterge fișa
====================================================== */
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID lipsă pentru ștergere." },
        { status: 400 }
      );
    }

    await prisma.device.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Eroare DELETE /devices:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}