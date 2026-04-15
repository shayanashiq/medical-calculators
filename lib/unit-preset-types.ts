/** One convertible unit; matches CalculatorField.unitOptions items. */
export type UnitPresetOption = {
  key: string;
  label: string;
  suffix?: string;
  mul: number;
  add?: number;
  min?: number;
  max?: number;
};

export type UnitPresetListItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  options: UnitPresetOption[];
};
