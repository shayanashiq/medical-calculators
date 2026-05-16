import type { CalculatorCategory } from "@/lib/categories";

export const seedCategories: CalculatorCategory[] = [
  {
    slug: "anthropometry",
    name: "Anthropometry & Body Composition",
    description: "BMI, body surface area, metabolic rate, and body composition screening tools.",
  },
  {
    slug: "nutrition-diet",
    name: "Nutrition & Diet",
    description: "Calorie needs, macro targets, and diet planning calculators for clinical and wellness use.",
  },
  {
    slug: "fitness-hydration",
    name: "Fitness & Hydration",
    description: "Training zones, hydration targets, and exercise-related health metrics.",
  },
  {
    slug: "cardiology",
    name: "Cardiology",
    description: "Blood pressure indices, cardiac risk scores, and hemodynamic estimates.",
  },
  {
    slug: "nephrology",
    name: "Nephrology & Fluids",
    description: "Kidney function, electrolyte correction, and fluid balance tools.",
  },
  {
    slug: "pulmonology",
    name: "Pulmonology",
    description: "Lung function estimates, oxygenation indices, and ventilator-related calculations.",
  },
  {
    slug: "gastroenterology",
    name: "Gastroenterology",
    description: "Hepatic scores, GI bleeding risk, and nutrition support in liver disease.",
  },
  {
    slug: "hematology",
    name: "Hematology",
    description: "Anemia indices, transfusion thresholds, and coagulation-related estimates.",
  },
  {
    slug: "endocrinology",
    name: "Endocrinology & Diabetes",
    description: "Glycemic control, insulin dosing aids, and endocrine reference calculators.",
  },
  {
    slug: "clinical-laboratory",
    name: "Clinical Laboratory",
    description: "Common bedside lab derivations, corrected values, and acid–base tools.",
  },
  {
    slug: "emergency-critical-care",
    name: "Emergency & Critical Care",
    description: "Severity scores, resuscitation metrics, and ICU decision support calculators.",
  },
  {
    slug: "pharmacology",
    name: "Pharmacology & Dosing",
    description: "Weight-based dosing, infusion rates, and pharmacokinetic helpers.",
  },
  {
    slug: "obstetrics-pediatrics",
    name: "Obstetrics & Pediatrics",
    description: "Pregnancy dating, pediatric growth, and age-specific clinical tools.",
  },
  {
    slug: "neurology",
    name: "Neurology",
    description: "Stroke scales, consciousness scoring, and neurologic severity indices.",
  },
  {
    slug: "oncology-supportive",
    name: "Oncology & Supportive Care",
    description: "Chemotherapy BSA dosing, performance status, and supportive care scores.",
  },
];
