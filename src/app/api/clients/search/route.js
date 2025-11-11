import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      take: 10,
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Eroare GET /api/clients/search:", error);
    return NextResponse.json(
      { error: "Eroare la căutarea clientului." },
      { status: 500 }
    );
  }
}