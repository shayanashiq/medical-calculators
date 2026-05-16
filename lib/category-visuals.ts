export type CategoryVisual = {
  color: string;
  bg: string;
  icon: string;
};

const defaultVisual: CategoryVisual = {
  color: "#0d9488",
  bg: "#ccfbf1",
  icon: "📊",
};

/** Styling hints for known slugs; new categories from the admin use `defaultVisual` via `getCategoryVisual`. */
export const categoryVisuals: Record<string, CategoryVisual> = {
  anthropometry: { color: "#4f46e5", bg: "#eef2ff", icon: "⚖️" },
  "nutrition-diet": { color: "#16a34a", bg: "#dcfce7", icon: "🥗" },
  "fitness-hydration": { color: "#ea580c", bg: "#ffedd5", icon: "🏃" },
  cardiology: { color: "#dc2626", bg: "#fee2e2", icon: "❤️" },
  nephrology: { color: "#0891b2", bg: "#cffafe", icon: "💧" },
  pulmonology: { color: "#7c3aed", bg: "#ede9fe", icon: "🫁" },
  gastroenterology: { color: "#ca8a04", bg: "#fef9c3", icon: "🩺" },
  hematology: { color: "#be123c", bg: "#ffe4e6", icon: "🩸" },
  endocrinology: { color: "#9333ea", bg: "#f3e8ff", icon: "💉" },
  "clinical-laboratory": { color: "#0d9488", bg: "#ccfbf1", icon: "🧪" },
  "emergency-critical-care": { color: "#b45309", bg: "#ffedd5", icon: "🚑" },
  pharmacology: { color: "#2563eb", bg: "#dbeafe", icon: "💊" },
  "obstetrics-pediatrics": { color: "#db2777", bg: "#fce7f3", icon: "👶" },
  neurology: { color: "#4f46e5", bg: "#e0e7ff", icon: "🧠" },
  "oncology-supportive": { color: "#64748b", bg: "#f1f5f9", icon: "🎗️" },
  clinical: { color: "#0d9488", bg: "#ccfbf1", icon: "🧪" },
};

export function getCategoryVisual(slug: string): CategoryVisual {
  return categoryVisuals[slug] ?? defaultVisual;
}

export function categoryEmojiForCalculator(category: string): string {
  return getCategoryVisual(category).icon;
}
