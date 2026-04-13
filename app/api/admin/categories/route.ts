import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateIncomingCategory } from "@/lib/admin-category-payload";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
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

  const parsed = validateIncomingCategory(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data } = parsed;

  const exists = await prisma.category.findUnique({ where: { slug: data.slug } });
  if (exists) {
    return NextResponse.json({ error: "A category with this slug already exists." }, { status: 409 });
  }

  const created = await prisma.category.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      sortOrder: data.sortOrder,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
