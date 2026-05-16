"use server";

import { headers } from "next/headers";
import { browseCalculatorsChunk } from "@/lib/calculator-queries";
import { runCalculator } from "@/lib/calculator-eval";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

function clientFingerprint(ip: string, userAgent: string, scope: string) {
  return `${scope}:${ip || "unknown"}:${userAgent || "unknown"}`;
}

function looksAutomated(userAgent: string) {
  return /bot|spider|crawler|curl|wget|python|scrapy|httpclient|axios|node-fetch/i.test(userAgent);
}

async function getRequestMeta() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for") ?? "";
  const ip =
    forwardedFor.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    headerStore.get("cf-connecting-ip") ||
    "unknown";
  const userAgent = headerStore.get("user-agent") ?? "";
  return { ip, userAgent };
}

export async function browseCalculatorsAction(input: {
  skip?: number;
  take?: number;
  q?: string;
}) {
  const { ip, userAgent } = await getRequestMeta();
  if (looksAutomated(userAgent)) {
    return { ok: false as const, error: "Automated traffic is blocked." };
  }

  const allowed = consumeRateLimit(clientFingerprint(ip, userAgent, "browse"), 90, 60_000);
  if (!allowed.ok) {
    return { ok: false as const, error: "Too many requests. Please wait a minute and try again." };
  }

  const skip = typeof input.skip === "number" && Number.isFinite(input.skip) ? input.skip : 0;
  const take = typeof input.take === "number" && Number.isFinite(input.take) ? input.take : 12;
  const q = typeof input.q === "string" ? input.q : undefined;
  const data = await browseCalculatorsChunk(skip, take, q);

  return { ok: true as const, ...data };
}

export async function calculateCalculatorAction(slug: string, values: Record<string, number>) {
  const { ip, userAgent } = await getRequestMeta();
  if (looksAutomated(userAgent)) {
    return { ok: false as const, error: "Automated traffic is blocked." };
  }

  const allowed = consumeRateLimit(clientFingerprint(ip, userAgent, `calculate:${slug}`), 30, 60_000);
  if (!allowed.ok) {
    return { ok: false as const, error: "Too many calculation attempts. Please wait a minute and try again." };
  }

  if (!values || typeof values !== "object") {
    return { ok: false as const, error: "values must be an object." };
  }

  const calculator = await prisma.calculator.findFirst({
    where: { slug, isPublished: true },
    include: { fields: true },
  });
  if (!calculator) {
    return { ok: false as const, error: "Calculator not found." };
  }

  const result = runCalculator(calculator, calculator.fields, values);
  if (!result.ok) {
    return { ok: false as const, error: result.error };
  }

  return { ok: true as const, results: result.results };
}
