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
  contentHtml?: string | null;
};
