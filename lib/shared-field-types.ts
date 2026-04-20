import type { UnitPresetOption } from "@/lib/unit-preset-types";

export type SharedFieldSelectOption = { label: string; value: number };

export type SharedFieldListItem = {
  id: string;
  slug: string;
  key: string;
  label: string;
  fieldType: "NUMBER" | "SELECT";
  min: number | null;
  max: number | null;
  step: number;
  defaultValue: number;
  selectOptions: SharedFieldSelectOption[] | null;
  unitOptions: UnitPresetOption[] | null;
  description: string | null;
};
