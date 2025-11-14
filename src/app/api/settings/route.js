import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET SETTINGS
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();

    return NextResponse.json({
      companyName: settings?.companyName || "",
      email:       settings?.email || "",
      phone:       settings?.phone || "",
      theme:       settings?.theme || "system",
      logoUrl:     settings?.logoUrl || "",
      tabStyle:    settings?.tabStyle || "classic",
    });
  } catch (err) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// UPDATE SETTINGS
export async function POST(req) {
  try {
    const body = await req.json();
    const existing = await prisma.settings.findFirst();

    const updated = existing
      ? await prisma.settings.update({
          where: { id: existing.id },
          data: {
            companyName: body.companyName,
            email: body.email,
            phone: body.phone,
            theme: body.theme,
            logoUrl: body.logoUrl,
            tabStyle: body.tabStyle,
          },
        })
      : await prisma.settings.create({
          data: {
            companyName: body.companyName || "",
            email:       body.email || "",
            phone:       body.phone || "",
            theme:       body.theme || "system",
            logoUrl:     body.logoUrl || "",
            tabStyle:    body.tabStyle || "classic",
          },
        });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST /api/settings error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}