import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ATENȚIE ⚠️ DUPĂ CE FOLOSEȘTI ACEST ENDPOINT, ȘTERGE FIȘIERUL!
export async function GET() {
  try {
    const email = "admin@procomputer.ro";
    const password = "admin123";
    const hash = bcrypt.hashSync(password, 10);

    // Ștergem adminul existent (dacă există)
    await prisma.user.deleteMany({
      where: { email },
    });

    // Creăm userul admin
    const user = await prisma.user.create({
      data: {
        name: "Administrator",
        email,
        password: hash,
        role: "admin",
        isActive: true,
        workHours: "09:00-17:00",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin creat cu succes!",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Eroare creare admin:", err);
    return NextResponse.json(
      { success: false, error: "Eroare la generarea adminului!" },
      { status: 500 }
    );
  }
}