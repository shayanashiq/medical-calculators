import type { FieldType } from "@prisma/client";
import type { UnitPresetOption } from "@/lib/unit-preset-types";

export type SeedSelectOption = { label: string; value: number };

export type SeedSharedField = {
  slug: string;
  key: string;
  label: string;
  fieldType: FieldType;
  min?: number | null;
  max?: number | null;
  step?: number;
  defaultValue?: number;
  selectOptions?: SeedSelectOption[] | null;
  unitPresetSlug?: string | null;
  unitOptions?: UnitPresetOption[] | null;
  description?: string | null;
};

export type SeedOutput = {
  label: string;
  unit: string;
  formula: string;
  decimals?: number;
  ranges?: Array<{
    min?: number;
    max?: number;
    variant: "good" | "warning" | "severe";
    guidance?: string;
    [fieldKey: string]: unknown;
  }>;
};

export type SeedFieldRef =
  | { shared: string; sortOrder?: number }
  | {
      key: string;
      label: string;
      fieldType: "NUMBER" | "SELECT";
      min?: number | null;
      max?: number | null;
      step?: number;
      defaultValue?: number;
      selectOptions?: SeedSelectOption[] | null;
      unitPresetSlug?: string | null;
      unitOptions?: UnitPresetOption[] | null;
      sortOrder?: number;
    };

export type SeedContentHints = {
  overview?: string;
  formulaNotes?: string;
  howToUse?: string[];
  interpretation?: string;
  clinicalNotes?: string;
  limitations?: string;
  faq?: Array<{ q: string; a: string }>;
};

export type SeedCalculator = {
  slug: string;
  name: string;
  description: string;
  formulaPlain: string;
  category: string;
  showOnHome?: boolean;
  isPublished?: boolean;
  fields: SeedFieldRef[];
  outputs: SeedOutput[];
  validationExpr?: string | null;
  validationMessage?: string | null;
  content?: SeedContentHints;
};
