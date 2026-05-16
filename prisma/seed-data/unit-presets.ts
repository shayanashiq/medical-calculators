import type { UnitPresetOption } from "@/lib/unit-preset-types";

export type SeedUnitPreset = {
  slug: string;
  name: string;
  description: string | null;
  options: UnitPresetOption[];
};

const lengthCm: UnitPresetOption[] = [
  { key: "cm", label: "cm", suffix: "cm", mul: 1, min: 30, max: 250, defaultValue: 170 },
  { key: "in", label: "in", suffix: "in", mul: 2.54, min: 12, max: 98, defaultValue: 67 },
  { key: "m", label: "m", suffix: "m", mul: 100, min: 0.5, max: 2.5, defaultValue: 1.7 },
];

const massKg: UnitPresetOption[] = [
  { key: "kg", label: "kg", suffix: "kg", mul: 1, min: 1, max: 300, defaultValue: 70 },
  { key: "lb", label: "lb", suffix: "lb", mul: 0.45359237, min: 2, max: 660, defaultValue: 154 },
  { key: "g", label: "g", suffix: "g", mul: 0.001, min: 1000, max: 300000, defaultValue: 70000 },
];

const bpMmHg: UnitPresetOption[] = [
  { key: "mmhg", label: "mmHg", suffix: "mmHg", mul: 1, min: 30, max: 300, defaultValue: 120 },
  { key: "kpa", label: "kPa", suffix: "kPa", mul: 7.50062, min: 4, max: 40, defaultValue: 16 },
];

const tempC: UnitPresetOption[] = [
  { key: "c", label: "°C", suffix: "°C", mul: 1, min: 32, max: 43, defaultValue: 37 },
  { key: "f", label: "°F", suffix: "°F", mul: 0.555556, add: -17.777778, min: 89.6, max: 109.4, defaultValue: 98.6 },
];

const labMeq: UnitPresetOption[] = [
  { key: "meq", label: "mEq/L", suffix: "mEq/L", mul: 1, min: 0, max: 200, defaultValue: 140 },
  { key: "mmol", label: "mmol/L", suffix: "mmol/L", mul: 1, min: 0, max: 200, defaultValue: 140 },
];

const labMgDl: UnitPresetOption[] = [
  { key: "mgdl", label: "mg/dL", suffix: "mg/dL", mul: 1, min: 0, max: 1000, defaultValue: 100 },
  { key: "mmol", label: "mmol/L", suffix: "mmol/L", mul: 0.0555, min: 0, max: 55, defaultValue: 5.5 },
];

const labGdl: UnitPresetOption[] = [
  { key: "gdl", label: "g/dL", suffix: "g/dL", mul: 1, min: 0, max: 10, defaultValue: 4 },
  { key: "gl", label: "g/L", suffix: "g/L", mul: 10, min: 0, max: 100, defaultValue: 40 },
];

const volumeMl: UnitPresetOption[] = [
  { key: "ml", label: "mL", suffix: "mL", mul: 1, min: 0, max: 10000, defaultValue: 500 },
  { key: "l", label: "L", suffix: "L", mul: 1000, min: 0, max: 10, defaultValue: 0.5 },
];

export const seedUnitPresets: SeedUnitPreset[] = [
  {
    slug: "length-stored-as-cm",
    name: "Length (stored as cm)",
    description: "Formulas expect centimeters. 1 inch = 2.54 cm.",
    options: lengthCm,
  },
  {
    slug: "mass-stored-as-kg",
    name: "Mass (stored as kg)",
    description: "Formulas expect kilograms.",
    options: massKg,
  },
  {
    slug: "blood-pressure-mmhg",
    name: "Blood pressure (mmHg)",
    description: "Systolic and diastolic pressure with kPa display option.",
    options: bpMmHg,
  },
  {
    slug: "temperature-celsius",
    name: "Temperature (°C stored)",
    description: "Body temperature with Fahrenheit display.",
    options: tempC,
  },
  {
    slug: "electrolyte-meq-l",
    name: "Electrolytes (mEq/L)",
    description: "Sodium, chloride, bicarbonate and similar units.",
    options: labMeq,
  },
  {
    slug: "concentration-mg-dl",
    name: "Concentration (mg/dL)",
    description: "Creatinine, glucose, BUN and similar chemistries.",
    options: labMgDl,
  },
  {
    slug: "concentration-g-dl",
    name: "Concentration (g/dL)",
    description: "Albumin, hemoglobin, protein concentrations.",
    options: labGdl,
  },
  {
    slug: "volume-ml",
    name: "Volume (mL)",
    description: "Urine output, fluids, and volumes in mL or liters.",
    options: volumeMl,
  },
];
