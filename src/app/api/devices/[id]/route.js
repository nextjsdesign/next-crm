import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  // ⛔ În Next.js 15/16, "params" este Promise → trebuie await
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing device id" },
      { status: 400 }
    );
  }

  try {
    const device = await prisma.device.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error("❌ Error in API /devices/[id]:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}