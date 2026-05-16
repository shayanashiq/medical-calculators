import { generatedCatalog } from "./generated-catalog";
import { applyContentHints } from "./content-hints";
import { patchCalculatorCatalog } from "./catalog-patches";
import type { SeedCalculator } from "../types";

const catalog = patchCalculatorCatalog(
  generatedCatalog.filter((c) => !c.slug.startsWith("clinical-index-")),
);

export const allCalculators: SeedCalculator[] = applyContentHints(catalog);
