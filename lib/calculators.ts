/**
 * Shared calculator types and category catalog.
 * Load calculator rows from the database via `@/lib/calculator-queries` (server) or the public API.
 */
export type { CalculatorListItem, PublicCalculator, PublicField } from "@/lib/calculator-types";
export {
  defaultCategoriesSeed,
  getAllCategories,
  getCategoryBySlug,
  getCategorySlugSet,
  type CalculatorCategory,
} from "@/lib/categories";
