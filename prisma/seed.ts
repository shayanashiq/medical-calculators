import "dotenv/config";
import { FieldType, PrismaClient } from "@prisma/client";
import { defaultCategoriesSeed } from "../lib/categories";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for seeding.");
}

const prisma = new PrismaClient();

const lengthUnitOptions = [
  { key: "cm", label: "cm", suffix: "cm", mul: 1, min: 100, max: 250 },
  { key: "in", label: "in", suffix: "in", mul: 2.54, min: 39.37, max: 98.43 },
];

const massUnitOptions = [
  { key: "kg", label: "kg", suffix: "kg", mul: 1, min: 20, max: 300 },
  { key: "lb", label: "lb", suffix: "lb", mul: 0.45359237, min: 44.09, max: 661.39 },
];

async function main() {
  await prisma.calculator.deleteMany();

  for (let i = 0; i < defaultCategoriesSeed.length; i++) {
    const c = defaultCategoriesSeed[i];
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, description: c.description, sortOrder: i },
      update: { name: c.name, description: c.description, sortOrder: i },
    });
  }

  const calculators: Parameters<typeof prisma.calculator.create>[0]["data"][] = [
    {
      slug: "bmi",
      name: "Body Mass Index (BMI)",
      formulaPlain: "BMI = kg / m²",
      description: "Screening index for weight status using height and weight.",
      category: "anthropometry",
      outputs: [
        {
          label: "BMI",
          unit: "",
          formula: "weight_kg / (height_cm / 100) ^ 2",
          decimals: 1,
          ranges: [
            { max: 18.4, variant: "warning" },
            { min: 18.5, max: 24.9, variant: "good" },
            { min: 25, max: 29.9, variant: "warning" },
            { min: 30, variant: "severe" },
          ],
        },
      ],
      fields: {
        create: [
          {
            key: "height_cm",
            label: "Height (cm)",
            fieldType: FieldType.NUMBER,
            min: 100,
            max: 250,
            step: 1,
            defaultValue: 170,
            sortOrder: 0,
            unitOptions: lengthUnitOptions,
          },
          {
            key: "weight_kg",
            label: "Weight (kg)",
            fieldType: FieldType.NUMBER,
            min: 20,
            max: 300,
            step: 1,
            defaultValue: 70,
            sortOrder: 1,
            unitOptions: massUnitOptions,
          },
        ],
      },
    },
    {
      slug: "bmr",
      name: "Basal Metabolic Rate (BMR)",
      formulaPlain: "Mifflin-St Jeor equation",
      description: "Estimated resting daily energy expenditure.",
      category: "anthropometry",
      outputs: [{ label: "BMR", unit: "kcal/day", formula: "10 * weight_kg + 6.25 * height_cm - 5 * age + (sex == 1 ? 5 : -161)", decimals: 0 }],
      fields: {
        create: [
          { key: "age", label: "Age (years)", fieldType: FieldType.NUMBER, min: 1, max: 120, step: 1, defaultValue: 30, sortOrder: 0 },
          {
            key: "sex",
            label: "Sex",
            fieldType: FieldType.SELECT,
            sortOrder: 1,
            defaultValue: 1,
            selectOptions: [
              { label: "Male", value: 1 },
              { label: "Female", value: 0 },
            ],
          },
          {
            key: "height_cm",
            label: "Height (cm)",
            fieldType: FieldType.NUMBER,
            min: 100,
            max: 250,
            step: 1,
            defaultValue: 170,
            sortOrder: 2,
            unitOptions: lengthUnitOptions,
          },
          {
            key: "weight_kg",
            label: "Weight (kg)",
            fieldType: FieldType.NUMBER,
            min: 20,
            max: 300,
            step: 1,
            defaultValue: 70,
            sortOrder: 3,
            unitOptions: massUnitOptions,
          },
        ],
      },
    },
    {
      slug: "tdee",
      name: "Total Daily Energy Expenditure (TDEE)",
      formulaPlain: "TDEE = BMR × activity factor",
      description: "Estimated daily calories including activity.",
      category: "anthropometry",
      outputs: [
        {
          label: "TDEE",
          unit: "kcal/day",
          formula:
            "(10 * weight_kg + 6.25 * height_cm - 5 * age + (sex == 1 ? 5 : -161)) * activity",
          decimals: 0,
        },
      ],
      fields: {
        create: [
          { key: "age", label: "Age (years)", fieldType: FieldType.NUMBER, min: 1, max: 120, step: 1, defaultValue: 30, sortOrder: 0 },
          {
            key: "sex",
            label: "Sex",
            fieldType: FieldType.SELECT,
            sortOrder: 1,
            defaultValue: 1,
            selectOptions: [
              { label: "Male", value: 1 },
              { label: "Female", value: 0 },
            ],
          },
          {
            key: "height_cm",
            label: "Height (cm)",
            fieldType: FieldType.NUMBER,
            min: 100,
            max: 250,
            step: 1,
            defaultValue: 170,
            sortOrder: 2,
            unitOptions: lengthUnitOptions,
          },
          {
            key: "weight_kg",
            label: "Weight (kg)",
            fieldType: FieldType.NUMBER,
            min: 20,
            max: 300,
            step: 1,
            defaultValue: 70,
            sortOrder: 3,
            unitOptions: massUnitOptions,
          },
          {
            key: "activity",
            label: "Activity factor",
            fieldType: FieldType.SELECT,
            sortOrder: 4,
            defaultValue: 1.375,
            selectOptions: [
              { label: "Sedentary (1.2)", value: 1.2 },
              { label: "Lightly active (1.375)", value: 1.375 },
              { label: "Moderately active (1.55)", value: 1.55 },
              { label: "Very active (1.725)", value: 1.725 },
              { label: "Extra active (1.9)", value: 1.9 },
            ],
          },
        ],
      },
    },
    {
      slug: "ideal-body-weight",
      name: "Ideal Body Weight",
      formulaPlain: "Devine equation",
      description: "Reference weight estimate based on height and sex.",
      category: "anthropometry",
      outputs: [
        {
          label: "Ideal weight",
          unit: "kg",
          formula: "(sex == 1 ? 50 : 45.5) + 2.3 * max(height_cm / 2.54 - 60, 0)",
          decimals: 1,
        },
      ],
      fields: {
        create: [
          {
            key: "height_cm",
            label: "Height (cm)",
            fieldType: FieldType.NUMBER,
            min: 100,
            max: 250,
            step: 1,
            defaultValue: 170,
            sortOrder: 0,
            unitOptions: lengthUnitOptions,
          },
          {
            key: "sex",
            label: "Sex",
            fieldType: FieldType.SELECT,
            sortOrder: 1,
            defaultValue: 1,
            selectOptions: [
              { label: "Male", value: 1 },
              { label: "Female", value: 0 },
            ],
          },
        ],
      },
    },
    {
      slug: "bsa",
      name: "Body Surface Area (BSA)",
      formulaPlain: "Mosteller equation",
      description: "Surface area estimate frequently used in dosing workflows.",
      category: "anthropometry",
      outputs: [{ label: "BSA", unit: "m²", formula: "sqrt(height_cm * weight_kg / 3600)", decimals: 2 }],
      fields: {
        create: [
          {
            key: "height_cm",
            label: "Height (cm)",
            fieldType: FieldType.NUMBER,
            min: 100,
            max: 250,
            step: 1,
            defaultValue: 170,
            sortOrder: 0,
            unitOptions: lengthUnitOptions,
          },
          {
            key: "weight_kg",
            label: "Weight (kg)",
            fieldType: FieldType.NUMBER,
            min: 20,
            max: 300,
            step: 1,
            defaultValue: 70,
            sortOrder: 1,
            unitOptions: massUnitOptions,
          },
        ],
      },
    },
    {
      slug: "body-fat",
      name: "Body Fat Percentage",
      formulaPlain: "US Navy circumference method",
      description: "Body-fat estimate from circumference measurements.",
      category: "anthropometry",
      validationExpr: "sex == 1 ? waist_cm > neck_cm : waist_cm + hip_cm > neck_cm",
      validationMessage:
        "For men, waist must be greater than neck. For women, waist plus hip must be greater than neck.",
      outputs: [
        {
          label: "Body fat",
          unit: "%",
          formula:
            "(sex == 1 ? (86.01 * log10(waist_cm / 2.54 - neck_cm / 2.54) - 70.041 * log10(height_cm / 2.54) + 36.76) : (163.205 * log10(waist_cm / 2.54 + hip_cm / 2.54 - neck_cm / 2.54) - 97.684 * log10(height_cm / 2.54) - 78.387))",
          decimals: 1,
        },
      ],
      fields: {
        create: [
          {
            key: "height_cm",
            label: "Height (cm)",
            fieldType: FieldType.NUMBER,
            min: 100,
            max: 250,
            step: 1,
            defaultValue: 170,
            sortOrder: 0,
            unitOptions: lengthUnitOptions,
          },
          {
            key: "sex",
            label: "Sex",
            fieldType: FieldType.SELECT,
            sortOrder: 1,
            defaultValue: 1,
            selectOptions: [
              { label: "Male", value: 1 },
              { label: "Female", value: 0 },
            ],
          },
          { key: "waist_cm", label: "Waist (cm)", fieldType: FieldType.NUMBER, min: 40, max: 180, step: 1, defaultValue: 82, sortOrder: 2 },
          { key: "neck_cm", label: "Neck (cm)", fieldType: FieldType.NUMBER, min: 20, max: 70, step: 1, defaultValue: 38, sortOrder: 3 },
          { key: "hip_cm", label: "Hip (cm)", fieldType: FieldType.NUMBER, min: 50, max: 200, step: 1, defaultValue: 95, sortOrder: 4 },
        ],
      },
    },
    {
      slug: "water-intake",
      name: "Daily Water Intake",
      formulaPlain: "35 ml/kg/day",
      description: "Hydration target based on body weight.",
      category: "fitness-hydration",
      outputs: [
        { label: "Daily water", unit: "ml/day", formula: "weight_kg * 35", decimals: 0 },
        { label: "Daily water", unit: "L/day", formula: "weight_kg * 35 / 1000", decimals: 2 },
      ],
      fields: {
        create: [
          {
            key: "weight_kg",
            label: "Weight (kg)",
            fieldType: FieldType.NUMBER,
            min: 20,
            max: 300,
            step: 1,
            defaultValue: 70,
            sortOrder: 0,
            unitOptions: massUnitOptions,
          },
        ],
      },
    },
    {
      slug: "target-heart-rate",
      name: "Target Heart Rate Zones",
      formulaPlain: "Karvonen method",
      description: "Training zones using age and resting heart rate.",
      category: "fitness-hydration",
      outputs: [
        { label: "Estimated max HR", unit: "bpm", formula: "220 - age", decimals: 0 },
        {
          label: "Moderate zone (low)",
          unit: "bpm",
          formula: "resting_hr + (220 - age - resting_hr) * 0.5",
          decimals: 0,
        },
        {
          label: "Moderate zone (high)",
          unit: "bpm",
          formula: "resting_hr + (220 - age - resting_hr) * 0.7",
          decimals: 0,
        },
        {
          label: "Vigorous zone (low)",
          unit: "bpm",
          formula: "resting_hr + (220 - age - resting_hr) * 0.7",
          decimals: 0,
        },
        {
          label: "Vigorous zone (high)",
          unit: "bpm",
          formula: "resting_hr + (220 - age - resting_hr) * 0.85",
          decimals: 0,
        },
      ],
      fields: {
        create: [
          { key: "age", label: "Age (years)", fieldType: FieldType.NUMBER, min: 1, max: 120, step: 1, defaultValue: 30, sortOrder: 0 },
          { key: "resting_hr", label: "Resting HR (bpm)", fieldType: FieldType.NUMBER, min: 30, max: 120, step: 1, defaultValue: 65, sortOrder: 1 },
        ],
      },
    },
    {
      slug: "creatinine-clearance",
      name: "Creatinine Clearance (CrCl)",
      formulaPlain: "Cockcroft-Gault equation",
      description: "Estimated creatinine clearance from age, sex, weight, and creatinine.",
      category: "clinical",
      validationExpr: "scr > 0",
      validationMessage: "Serum creatinine must be greater than zero.",
      outputs: [{ label: "CrCl", unit: "ml/min", formula: "((140 - age) * weight_kg / (72 * scr)) * (sex == 0 ? 0.85 : 1)", decimals: 0 }],
      fields: {
        create: [
          { key: "age", label: "Age (years)", fieldType: FieldType.NUMBER, min: 1, max: 120, step: 1, defaultValue: 30, sortOrder: 0 },
          {
            key: "weight_kg",
            label: "Weight (kg)",
            fieldType: FieldType.NUMBER,
            min: 20,
            max: 300,
            step: 1,
            defaultValue: 70,
            sortOrder: 1,
            unitOptions: massUnitOptions,
          },
          {
            key: "sex",
            label: "Sex",
            fieldType: FieldType.SELECT,
            sortOrder: 2,
            defaultValue: 1,
            selectOptions: [
              { label: "Male", value: 1 },
              { label: "Female", value: 0 },
            ],
          },
          { key: "scr", label: "Serum creatinine (mg/dL)", fieldType: FieldType.NUMBER, min: 0.2, max: 15, step: 0.1, defaultValue: 1, sortOrder: 3 },
        ],
      },
    },
    {
      slug: "corrected-calcium",
      name: "Corrected Calcium",
      formulaPlain: "Corrected Ca = measured + 0.8 × (4 - albumin)",
      description: "Albumin-corrected total calcium estimate.",
      category: "clinical",
      outputs: [
        { label: "Corrected calcium", unit: "mg/dL", formula: "measured_ca + 0.8 * (4 - albumin)", decimals: 2 },
      ],
      fields: {
        create: [
          { key: "measured_ca", label: "Measured calcium (mg/dL)", fieldType: FieldType.NUMBER, min: 4, max: 20, step: 0.1, defaultValue: 9.1, sortOrder: 0 },
          { key: "albumin", label: "Albumin (g/dL)", fieldType: FieldType.NUMBER, min: 1, max: 6, step: 0.1, defaultValue: 4, sortOrder: 1 },
        ],
      },
    },
    {
      slug: "anion-gap",
      name: "Anion Gap",
      formulaPlain: "AG = Na - (Cl + HCO3)",
      description: "Calculated serum anion gap from routine electrolytes.",
      category: "clinical",
      outputs: [{ label: "Anion gap", unit: "mEq/L", formula: "na - (cl + hco3)", decimals: 0 }],
      fields: {
        create: [
          { key: "na", label: "Sodium (mEq/L)", fieldType: FieldType.NUMBER, min: 100, max: 180, step: 1, defaultValue: 140, sortOrder: 0 },
          { key: "cl", label: "Chloride (mEq/L)", fieldType: FieldType.NUMBER, min: 60, max: 140, step: 1, defaultValue: 103, sortOrder: 1 },
          { key: "hco3", label: "Bicarbonate (mEq/L)", fieldType: FieldType.NUMBER, min: 5, max: 50, step: 1, defaultValue: 24, sortOrder: 2 },
        ],
      },
    },
    {
      slug: "map",
      name: "Mean Arterial Pressure (MAP)",
      formulaPlain: "MAP = (SBP + 2 × DBP) / 3",
      description: "Perfusion pressure estimate from blood pressure values.",
      category: "clinical",
      validationExpr: "sbp > dbp",
      validationMessage: "Diastolic pressure should be lower than systolic.",
      outputs: [
        { label: "MAP", unit: "mmHg", formula: "(sbp + 2 * dbp) / 3", decimals: 0 },
        { label: "Pulse pressure", unit: "mmHg", formula: "sbp - dbp", decimals: 0 },
      ],
      fields: {
        create: [
          { key: "sbp", label: "Systolic BP (mmHg)", fieldType: FieldType.NUMBER, min: 60, max: 260, step: 1, defaultValue: 120, sortOrder: 0 },
          { key: "dbp", label: "Diastolic BP (mmHg)", fieldType: FieldType.NUMBER, min: 30, max: 160, step: 1, defaultValue: 80, sortOrder: 1 },
        ],
      },
    },
  ];

  for (const data of calculators) {
    await prisma.calculator.create({ data });
  }

  await prisma.unitPreset.deleteMany();
  await prisma.unitPreset.createMany({
    data: [
      {
        slug: "length-stored-as-cm",
        name: "Length (stored as cm)",
        description: "Use when formulas expect height in centimeters. 1 in = 2.54 cm.",
        options: [
          { key: "cm", label: "cm", suffix: "cm", mul: 1, min: 100, max: 250 },
          { key: "in", label: "in", suffix: "in", mul: 2.54, min: 39.37, max: 98.43 },
        ],
      },
      {
        slug: "mass-stored-as-kg",
        name: "Mass (stored as kg)",
        description: "Use when formulas expect weight in kilograms.",
        options: [
          { key: "kg", label: "kg", suffix: "kg", mul: 1, min: 20, max: 300 },
          { key: "lb", label: "lb", suffix: "lb", mul: 0.45359237, min: 44.09, max: 661.39 },
        ],
      },
    ],
  });

  console.log(`Seeded ${calculators.length} calculators and default unit presets.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
