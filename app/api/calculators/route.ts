import { NextResponse } from "next/server";
import { browseCalculatorsChunk } from "@/lib/calculator-queries";

const DEFAULT_TAKE = 12;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const skipRaw = searchParams.get("skip");
  const takeRaw = searchParams.get("take");
  const skip = skipRaw != null ? Number.parseInt(skipRaw, 10) : 0;
  const take = takeRaw != null ? Number.parseInt(takeRaw, 10) : DEFAULT_TAKE;
  const safeSkip = Number.isFinite(skip) && skip >= 0 ? skip : 0;
  const safeTake = Number.isFinite(take) && take > 0 ? take : DEFAULT_TAKE;

  const { items, total } = await browseCalculatorsChunk(safeSkip, safeTake, q);
  return NextResponse.json({ items, total });
}
