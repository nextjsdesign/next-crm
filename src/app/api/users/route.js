import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

// 🔹 GET: Toate conturile de utilizatori
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🔹 POST: Creează un utilizator nou
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.email || !data.password || !data.name) {
      return NextResponse.json({ error: "Date incomplete." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Există deja un cont cu acest email." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🔹 PUT: Actualizează un utilizator existent (prin id)
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, password, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: "ID lipsă pentru actualizare." }, { status: 400 });
    }

    // dacă s-a introdus o parolă nouă, o criptăm
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🔹 DELETE: Șterge un utilizator (prin id)
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID lipsă pentru ștergere." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}