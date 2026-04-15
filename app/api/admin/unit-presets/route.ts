import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateIncomingUnitPreset } from "@/lib/admin-unit-preset-payload";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.unitPreset.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateIncomingUnitPreset(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data } = parsed;

  try {
    const row = await prisma.unitPreset.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        options: data.options,
      },
    });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Could not create preset (slug may already exist)." }, { status: 400 });
  }
}
