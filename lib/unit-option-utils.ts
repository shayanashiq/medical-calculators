import type { UnitPresetOption } from "@/lib/unit-preset-types";

export function toBaseUnitValue(value: number, option: UnitPresetOption): number {
  const add = typeof option.add === "number" ? option.add : 0;
  return (value + add) * option.mul;
}

export function fromBaseUnitValue(baseValue: number, option: UnitPresetOption): number {
  const add = typeof option.add === "number" ? option.add : 0;
  return baseValue / option.mul - add;
}

export function resolveUnitDisplayDefault(
  baseDefaultValue: number,
  option?: UnitPresetOption,
): number {
  if (!option) {
    return baseDefaultValue;
  }
  if (typeof option.defaultValue === "number" && Number.isFinite(option.defaultValue)) {
    return option.defaultValue;
  }
  return fromBaseUnitValue(baseDefaultValue, option);
}

export function resolveUnitDisplayMin(
  baseMin: number | null,
  option?: UnitPresetOption,
): number | null {
  if (baseMin == null) {
    return null;
  }
  if (option && typeof option.min === "number" && Number.isFinite(option.min)) {
    return option.min;
  }
  return option ? fromBaseUnitValue(baseMin, option) : baseMin;
}

export function resolveUnitDisplayMax(
  baseMax: number | null,
  option?: UnitPresetOption,
): number | null {
  if (baseMax == null) {
    return null;
  }
  if (option && typeof option.max === "number" && Number.isFinite(option.max)) {
    return option.max;
  }
  return option ? fromBaseUnitValue(baseMax, option) : baseMax;
}
