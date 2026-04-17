import type {
  CalculatorListItem,
  CalculatorOutputDef,
  PublicCalculator,
  PublicField,
} from "@/lib/calculator-types";
import {
  CALCULATORS_PAGE_SIZE,
  totalPages as computeTotalPages,
} from "@/lib/list-pagination";
import { prisma } from "@/lib/prisma";

const listSelect = {
  slug: true,
  category: true,
  name: true,
  formulaPlain: true,
  description: true,
  imageUrl: true,
  showOnHome: true,
} as const;

export type PaginatedCalculators = {
  items: CalculatorListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listCalculators(): Promise<CalculatorListItem[]> {
  return prisma.calculator.findMany({
    select: listSelect,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export async function listShowOnHomeCalculators(): Promise<CalculatorListItem[]> {
  return prisma.calculator.findMany({
    where: { showOnHome: true },
    select: listSelect,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

function calculatorsSearchWhere(searchRaw: string | undefined) {
  const q = searchRaw?.trim();
  if (!q) {
    return {};
  }
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
    ],
  };
}

const BROWSE_MAX_TAKE = 24;

export async function browseCalculatorsChunk(
  skip: number,
  take: number,
  search?: string,
): Promise<{ items: CalculatorListItem[]; total: number }> {
  const where = calculatorsSearchWhere(search);
  const total = await prisma.calculator.count({ where });
  const safeSkip = Math.max(0, Math.floor(skip));
  const safeTake = Math.min(Math.max(1, Math.floor(take)), BROWSE_MAX_TAKE);
  const items = await prisma.calculator.findMany({
    where,
    select: listSelect,
    orderBy: [{ category: "asc" }, { name: "asc" }],
    skip: safeSkip,
    take: safeTake,
  });
  return { items, total };
}

export async function listCalculatorsPaginated(
  page: number,
  search?: string,
): Promise<PaginatedCalculators> {
  const pageSize = CALCULATORS_PAGE_SIZE;
  const where = calculatorsSearchWhere(search);
  const total = await prisma.calculator.count({ where });
  const totalPages = computeTotalPages(total, pageSize);
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * pageSize;
  const items = await prisma.calculator.findMany({
    where,
    select: listSelect,
    orderBy: [{ category: "asc" }, { name: "asc" }],
    skip,
    take: pageSize,
  });
  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export async function getCalculatorBySlug(slug: string): Promise<PublicCalculator | null> {
  const row = await prisma.calculator.findUnique({
    where: { slug },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });
  if (!row) {
    return null;
  }
  const fields: PublicField[] = row.fields.map((f) => ({
    key: f.key,
    label: f.label,
    fieldType: f.fieldType,
    min: f.min,
    max: f.max,
    step: f.step,
    defaultValue: f.defaultValue,
    selectOptions: f.selectOptions as PublicField["selectOptions"],
    unitOptions: (f.unitOptions as PublicField["unitOptions"]) ?? null,
  }));
  const outputs = (Array.isArray(row.outputs) ? row.outputs : []) as CalculatorOutputDef[];

  return {
    slug: row.slug,
    category: row.category,
    name: row.name,
    formulaPlain: row.formulaPlain,
    description: row.description,
    imageUrl: row.imageUrl,
    showOnHome: row.showOnHome,
    fields,
    outputs,
    contentHtml: row.contentHtml ?? null,
    limitationsDetailed: row.limitationsDetailed ?? null,
  };
}

export async function getCalculatorsByCategory(category: string): Promise<CalculatorListItem[]> {
  return prisma.calculator.findMany({
    where: { category },
    select: listSelect,
    orderBy: { name: "asc" },
  });
}

export async function getRelatedCalculatorsByCategory(
  category: string,
  currentSlug: string,
  limit = 6,
): Promise<CalculatorListItem[]> {
  const safeLimit = Math.max(1, Math.min(12, Math.floor(limit)));
  return prisma.calculator.findMany({
    where: {
      category,
      slug: { not: currentSlug },
    },
    select: listSelect,
    orderBy: { name: "asc" },
    take: safeLimit,
  });
}

export async function getCalculatorsByCategoryPaginated(
  category: string,
  page: number,
  search?: string,
): Promise<PaginatedCalculators> {
  const pageSize = CALCULATORS_PAGE_SIZE;
  const q = search?.trim();
  const where = q
    ? {
        category,
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : { category };
  const total = await prisma.calculator.count({ where });
  const totalPages = computeTotalPages(total, pageSize);
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * pageSize;
  const items = await prisma.calculator.findMany({
    where,
    select: listSelect,
    orderBy: { name: "asc" },
    skip,
    take: pageSize,
  });
  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}
