import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID lipsă" }, { status: 400 });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error marking notification as read:", e);
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}