export type ContentBlock = { id: string; heading: string; content: string };

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function decodeBasicEntities(text: string): string {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

export function paragraphsFromPlainText(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => `<p>${escapeHtml(chunk).replaceAll("\n", "<br />")}</p>`)
    .join("");
}

function bodyFromContentField(content: string): string {
  const c = content.trim();
  if (!c) {
    return "";
  }
  if (/^[\s\n]*</.test(c)) {
    return c;
  }
  return paragraphsFromPlainText(c);
}

export function newContentBlockId(): string {
  return `cb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildContentHtmlFromBlocks(blocks: ContentBlock[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (!b.heading.trim() && !b.content.trim()) {
      continue;
    }
    const title = escapeHtml(b.heading.trim() || "Section");
    const body = bodyFromContentField(b.content);
    parts.push(
      `<section class="rounded-xl border border-slate-200 bg-white p-4"><h3>${title}</h3>${body}</section>`,
    );
  }
  if (parts.length === 0) {
    return "";
  }
  return `<div class="space-y-3">${parts.join("")}</div>`;
}

export function parseContentHtmlToBlocks(html: string): ContentBlock[] {
  const trimmed = html.trim();
  if (!trimmed) {
    return [];
  }
  const blocks: ContentBlock[] = [];
  const re = /<section[^>]*>\s*<h3>([\s\S]*?)<\/h3>\s*([\s\S]*?)<\/section>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(trimmed)) !== null) {
    const heading = decodeBasicEntities(stripHtmlTags(m[1]));
    const content = m[2].trim();
    blocks.push({ id: newContentBlockId(), heading, content });
  }
  if (blocks.length === 0) {
    blocks.push({ id: newContentBlockId(), heading: "Content", content: trimmed });
  }
  return blocks;
}

/** Inserts detailed limitations after the Clinical Significance section when that heading exists; otherwise appends inside the article wrapper. */
export function mergeArticleHtmlWithDetailedLimitations(
  contentHtml: string | null | undefined,
  limitationsDetailed: string | null | undefined,
): string | null {
  const base = contentHtml?.trim() ?? "";
  const detRaw = limitationsDetailed?.trim() ?? "";
  if (!detRaw) {
    return base || null;
  }
  const detailedSection = `<section class="rounded-xl border border-slate-200 bg-white p-4"><h3>Detailed limitations</h3>${paragraphsFromPlainText(detRaw)}</section>`;
  if (!base) {
    return `<div class="space-y-3">${detailedSection}</div>`;
  }
  const csRe = /(<section[^>]*>\s*<h3>\s*Clinical Significance\s*<\/h3>[\s\S]*?<\/section>)/i;
  if (csRe.test(base)) {
    return base.replace(csRe, `$1${detailedSection}`);
  }
  const wrapRe = /^(\s*<div\b[^>]*\bclass="[^"]*space-y-3[^"]*"[^>]*>)([\s\S]*)(<\/div>\s*)$/i;
  const wm = base.match(wrapRe);
  if (wm) {
    return `${wm[1]}${wm[2]}${detailedSection}${wm[3]}`;
  }
  return `${base}${detailedSection}`;
}
