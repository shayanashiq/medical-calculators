const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type IncomingCategoryBody = {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
};

export function validateIncomingCategory(
  body: unknown,
): { ok: true; data: IncomingCategoryBody } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }
  const b = body as Record<string, unknown>;

  const slug = typeof b.slug === "string" ? b.slug.trim() : "";
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const description = typeof b.description === "string" ? b.description.trim() : "";
  const sortOrderRaw = b.sortOrder;
  const sortOrder =
    typeof sortOrderRaw === "number" && Number.isFinite(sortOrderRaw)
      ? Math.floor(sortOrderRaw)
      : typeof sortOrderRaw === "string" && sortOrderRaw.trim() !== "" && Number.isFinite(Number(sortOrderRaw))
        ? Math.floor(Number(sortOrderRaw))
        : 0;

  if (!slugRe.test(slug)) {
    return { ok: false, error: "Slug must be lowercase letters, numbers, and hyphens only." };
  }
  if (!name) {
    return { ok: false, error: "Name is required." };
  }
  if (!description) {
    return { ok: false, error: "Description is required." };
  }

  return { ok: true, data: { slug, name, description, sortOrder } };
}

export type IncomingCategoryPatchBody = {
  name: string;
  description: string;
  sortOrder: number;
};

export function validateIncomingCategoryPatch(
  body: unknown,
): { ok: true; data: IncomingCategoryPatchBody } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const description = typeof b.description === "string" ? b.description.trim() : "";
  const sortOrderRaw = b.sortOrder;
  const sortOrder =
    typeof sortOrderRaw === "number" && Number.isFinite(sortOrderRaw)
      ? Math.floor(sortOrderRaw)
      : typeof sortOrderRaw === "string" && sortOrderRaw.trim() !== "" && Number.isFinite(Number(sortOrderRaw))
        ? Math.floor(Number(sortOrderRaw))
        : 0;

  if (!name) {
    return { ok: false, error: "Name is required." };
  }
  if (!description) {
    return { ok: false, error: "Description is required." };
  }

  return { ok: true, data: { name, description, sortOrder } };
}
