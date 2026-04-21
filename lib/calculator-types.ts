/** Row shape for calculator cards and listings */
export type CalculatorListItem = {
  slug: string;
  category: string;
  name: string;
  formulaPlain: string;
  description: string;
  imageUrl: string | null;
  showOnHome: boolean;
};

export type CalculatorOutputDef = {
  label: string;
  unit: string;
  formula: string;
  /** Used when output has no ranges, or as fallback guidance text. */
  guidance?: string;
  /** Optional limitation notes for this output/calculator result. */
  limitations?: string;
  decimals?: number;
  ranges?: Array<{
    min?: number;
    max?: number;
    variant: "good" | "warning" | "severe";
    guidance?: string;
    /** Optional extra numeric conditions keyed by input field key, e.g. { sex: 1 }. */
    [fieldKey: string]: unknown;
  }>;
};

export type PublicField = {
  key: string;
  label: string;
  fieldType: "NUMBER" | "SELECT";
  min: number | null;
  max: number | null;
  step: number;
  defaultValue: number;
  selectOptions: { label: string; value: number }[] | null;
  unitOptions?: Array<{
    key: string;
    label: string;
    suffix?: string;
    mul: number;
    add?: number;
    min?: number;
    max?: number;
  }> | null;
};

export type PublicCalculator = CalculatorListItem & {
  fields: PublicField[];
  /** Output definitions (formulas, ranges for indicator) — same order as calculate API results. */
  outputs: CalculatorOutputDef[];
  /** Optional SEO keyword sets (admin-managed). */
  seo?: {
    specific?: string[];
    problems?: string[];
    promos?: string[];
  } | null;
  contentHtml?: string | null;
  /** Long-form limitations for the article (after Clinical Significance when that section exists). */
  limitationsDetailed?: string | null;
};
