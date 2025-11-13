import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await prisma.settings.findFirst();
  return NextResponse.json(settings || {});
}

export async function POST(req) {
  const data = await req.json();

  // dacă nu există în DB, creăm, altfel actualizăm
  const existing = await prisma.settings.findFirst();
  const settings = existing
    ? await prisma.settings.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.settings.create({ data });

  return NextResponse.json(settings);
}