import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// VALIDATOR ObjectId (Mongo)
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

//
// ============================
//          GET NOTIFICATIONS
// ============================
//
export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    // ID lipsă sau invalid → returnăm 0 notificări
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ notifications });
  } catch (e) {
    console.error("Eroare în GET /api/notifications:", e);
    return NextResponse.json({ notifications: [] }, { status: 200 });
  }
}

//
// ============================
//      PATCH – MARK AS READ
// ============================
//
export async function PATCH(req) {
  try {
    const { id } = await req.json();

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ ok: true });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Eroare în PATCH /api/notifications:", e);
    return NextResponse.json({ ok: false });
  }
}

//
// ============================
//        DELETE NOTIFICATION
// ============================
//
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ ok: true });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Eroare în DELETE /api/notifications:", e);
    return NextResponse.json({ ok: false });
  }
}