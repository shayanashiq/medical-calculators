export type CategoryVisual = {
  color: string;
  bg: string;
  icon: string;
};

const defaultVisual: CategoryVisual = {
  color: "#0ea5e9",
  bg: "#e0f2fe",
  icon: "📊",
};

/** Styling hints for known slugs; new categories from the admin use `defaultVisual` via `getCategoryVisual`. */
export const categoryVisuals: Record<string, CategoryVisual> = {
  anthropometry: {
    color: "#4f6ef7",
    bg: "#eef0fe",
    icon: "⚖️",
  },
  "fitness-hydration": {
    color: "#f97316",
    bg: "#ffedd5",
    icon: "🏃",
  },
  clinical: {
    color: "#2dd4bf",
    bg: "#ccfbf1",
    icon: "🧪",
  },
};

export function getCategoryVisual(slug: string): CategoryVisual {
  return categoryVisuals[slug] ?? defaultVisual;
}

export function categoryEmojiForCalculator(category: string): string {
  return getCategoryVisual(category).icon;
}
