import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, password } = await req.json();

  const dataToUpdate = { name };
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    dataToUpdate.password = hashed;
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: dataToUpdate,
  });

  return NextResponse.json({ success: true });
}
