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
  decimals?: number;
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
};

export type PublicCalculator = CalculatorListItem & {
  fields: PublicField[];
};
