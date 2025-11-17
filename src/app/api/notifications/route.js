import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

//
// ============================
//      GET NOTIFICATIONS
// ============================
//
export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    // Dacă nu e UUID → ignorăm verificarea (Postgres UUID poate avea multe formate)
    if (!userId) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ notifications });
  } catch (e) {
    console.error("❌ Eroare GET /api/notifications:", e);
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

    if (!id) {
      return NextResponse.json({ ok: false });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ Eroare PATCH /api/notifications:", e);
    return NextResponse.json({ ok: false });
  }
}

//
// ============================
//      DELETE NOTIFICATION
// ============================
//
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ ok: false });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ Eroare DELETE /api/notifications:", e);
    return NextResponse.json({ ok: false });
  }
}