import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function normalizeKeywordList(raw: unknown, max = 60): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of raw) {
    if (typeof v !== "string") continue;
    const t = v.trim().replace(/\s+/g, " ");
    if (!t) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= max) break;
  }
  return out.length ? out : undefined;
}

function normalizeSeo(
  raw: unknown,
): { specific?: string[]; problems?: string[]; promos?: string[]; longTail?: string[]; contentExpansion?: string[] } | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const specific = normalizeKeywordList(r.specific);
  const problems = normalizeKeywordList(r.problems);
  const promos = normalizeKeywordList(r.promos);
  const longTail = normalizeKeywordList(r.longTail);
  const contentExpansion = normalizeKeywordList(r.contentExpansion);
  if (!specific && !problems && !promos && !longTail && !contentExpansion) return null;
  return {
    ...(specific ? { specific } : {}),
    ...(problems ? { problems } : {}),
    ...(promos ? { promos } : {}),
    ...(longTail ? { longTail } : {}),
    ...(contentExpansion ? { contentExpansion } : {}),
  };
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = (body && typeof body === "object") ? (body as Record<string, unknown>) : null;
  if (!b) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const seo = normalizeSeo(b.seo);

  const exists = await prisma.calculator.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.calculator.update({
    where: { id },
    data: { seo },
  });

  return NextResponse.json({ ok: true });
}

