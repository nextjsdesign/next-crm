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

    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        client: true,
        user: true,
        repairs: {
          include: { items: true },
        },
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Fișa nu există" },
        { status: 404 }
      );
    }

    return NextResponse.json(device);
  } catch (err) {
    console.error("❌ Eroare repair-init:", err);
    return NextResponse.json(
      { error: "Eroare server" },
      { status: 500 }
    );
  }
}