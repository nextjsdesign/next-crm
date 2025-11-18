import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateFormCode } from "@/lib/generateFormCode";
import { nanoid } from "nanoid";

/* ================================================================
   🔹 POST — Creează o fișă nouă (cu formCode generat automat)
================================================================ */
export async function POST(request) {
  try {
    const data = await request.json();

    // 🔍 1) Verificăm clientul sau îl creăm
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

    // 🔍 2) Preluăm device părinte dacă există
    let parentDevice = null;
    if (data.selectedDeviceId) {
      parentDevice = await prisma.device.findUnique({
        where: { id: data.selectedDeviceId },
      });
    }

    // 🔥 3) Generăm formCode unic
    let formCode = generateFormCode();
    let exists = await prisma.device.findUnique({ where: { formCode } });

    while (exists) {
      formCode = generateFormCode();
      exists = await prisma.device.findUnique({ where: { formCode } });
    }

    // 🛠️ 4) Creăm fișa nouă cu formCode
    const device = await prisma.device.create({
      data: {
        publicToken: nanoid(12),
        
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

        // ⭐ Cod unic
        formCode: formCode,
      },
      include: { client: true },
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error("❌ Eroare POST /devices:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ================================================================
   🔹 PUT — Actualizează o fișă existentă
================================================================ */
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
        priceEstimate: updateData.priceEstimate
          ? parseFloat(updateData.priceEstimate)
          : 0,
        advance: updateData.advance ? parseFloat(updateData.advance) : 0,
        warranty: updateData.warranty || null,
        priceConfirmed: updateData.priceConfirmed || false,
        liquidContact: updateData.liquidContact || false,
        deliveryDays: updateData.deliveryDays
          ? parseInt(updateData.deliveryDays)
          : null,
        notes: updateData.notes || "",
        deliveryDate: updateData.deliveryDate
          ? new Date(updateData.deliveryDate)
          : null,
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

/* ================================================================
   🔹 DELETE — Șterge fișa
================================================================ */
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