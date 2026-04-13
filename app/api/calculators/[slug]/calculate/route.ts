import { NextResponse } from "next/server";
import { runCalculator } from "@/lib/calculator-eval";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const calculator = await prisma.calculator.findUnique({
    where: { slug },
    include: { fields: true },
  });
  if (!calculator) {
    return NextResponse.json({ error: "Calculator not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("values" in body)) {
    return NextResponse.json({ error: "Expected { values: Record<string, number> }." }, { status: 400 });
  }

  const values = (body as { values: Record<string, unknown> }).values;
  if (!values || typeof values !== "object") {
    return NextResponse.json({ error: "values must be an object." }, { status: 400 });
  }

  const result = runCalculator(calculator, calculator.fields, values);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ results: result.results });
}
