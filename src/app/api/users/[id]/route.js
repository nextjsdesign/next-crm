import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/** 🔧 ia sigur ID-ul din context (params e Promise în Turbopack) */
async function getId(ctx) {
  try {
    const { id } = await ctx?.params;        // ⬅️ AICI e cheia
    return id ? String(id) : null;
  } catch {
    return null;
  }
}

/** GET /api/users/[id] */
export async function GET(req, ctx) {
  try {
    const id = await getId(ctx);
    if (!id) return NextResponse.json({ error: "ID invalid" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "Utilizatorul nu a fost găsit" }, { status: 404 });

    return NextResponse.json(user);
  } catch (err) {
    console.error("❌ GET user error:", err);
    return NextResponse.json({ error: "Eroare la preluarea utilizatorului" }, { status: 500 });
  }
}

/** PATCH /api/users/[id] */
export async function PATCH(req, ctx) {
  try {
    const id = await getId(ctx);
    if (!id) return NextResponse.json({ error: "ID invalid" }, { status: 400 });

    const body = await req.json();

    // 🔗 compune programul dacă vin startHour/endHour
    let workHours = body.workHours || "";
    if (body.startHour && body.endHour) {
      workHours = `${body.startHour}-${body.endHour}`;
    }

    const data = {
      name: body.name ?? undefined,
      email: body.email ?? undefined,
      role: body.role ?? undefined,
      workHours,
      updatedAt: new Date(),
    };

    // 🔐 schimbare parolă (opțional)
    if (body.password && body.password.trim() !== "") {
      data.password = await bcrypt.hash(body.password.trim(), 10);
    }

    // 🔘 activ/inactiv (opțional)
    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    // 🎯 doar pentru technician: target/bonus, altfel null
    if (body.role === "technician") {
      data.target = typeof body.target === "number" ? body.target : Number(body.target) || 0;
      data.bonus  = typeof body.bonus  === "number" ? body.bonus  : Number(body.bonus)  || 0;
    } else if (body.role) {
      data.target = null;
      data.bonus  = null;
    }

    const updated = await prisma.user.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ PATCH user error:", err);
    return NextResponse.json({ error: "Eroare la actualizarea utilizatorului" }, { status: 500 });
  }
}

/** DELETE /api/users/[id] */
export async function DELETE(req, ctx) {
  try {
    const id = await getId(ctx);
    if (!id) return NextResponse.json({ error: "ID invalid" }, { status: 400 });

    const deleted = await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Utilizator șters", deleted });
  } catch (err) {
    console.error("❌ DELETE user error:", err);
    return NextResponse.json({ error: "Eroare la ștergere utilizator" }, { status: 500 });
  }
}