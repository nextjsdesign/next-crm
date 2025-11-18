import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { token } = params;

    const device = await prisma.device.findUnique({
      where: { publicToken: token },
      include: {
        client: true,
        user: true,
      },
    });

    if (!device) {
      return NextResponse.json({ error: "Fișă inexistentă." }, { status: 404 });
    }

    return NextResponse.json({
      formCode: device.formCode,
      status: device.status,
      client: device.client,
      deviceType: device.deviceType,
      brand: device.brand,
      model: device.model,
      serialNumber: device.serialNumber,
      problem: device.problem,
      accessories: device.accessories,
      technician: device.technician,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    });
  } catch (error) {
    console.error("API TRACK ERROR:", error);
    return NextResponse.json({ error: "Eroare server." }, { status: 500 });
  }
}