import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// 🔹 GET – listă utilizatori
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json(
      { error: "Eroare la încărcarea utilizatorilor" },
      { status: 500 }
    );
  }
}

// 🔹 POST – adaugă utilizator nou
export async function POST(req) {
  try {
    const body = await req.json();

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role || "technician",
        workHours:
          body.startHour && body.endHour
            ? `${body.startHour}-${body.endHour}`
            : "",
        target: body.target ? Number(body.target) : 0,
        bonus: body.bonus ? Number(body.bonus) : 0,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return NextResponse.json(
      { error: "Eroare la adăugarea utilizatorului" },
      { status: 500 }
    );
  }
}