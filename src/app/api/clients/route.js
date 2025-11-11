import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone = "", email = "" } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Numele clientului este obligatoriu." },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        phone,
        email,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Eroare POST /api/clients:", error);
    return NextResponse.json(
      { error: "Eroare la crearea clientului." },
      { status: 500 }
    );
  }
}