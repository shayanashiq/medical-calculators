import { calc, num, out, sel } from "./helpers";
import type { SeedCalculator, SeedFieldRef, SeedOutput } from "../types";

/** Fix invalid formulas, duplicate fields, and weak placeholder scores after catalog generation. */
export function patchCalculatorCatalog(items: SeedCalculator[]): SeedCalculator[] {
  const bySlug = new Map(items.map((c) => [c.slug, c]));
  const drop = new Set([
    "fat-mass-index",
    "forrest-risk",
    "wells-dvt-alt",
    "apache-proxy",
    "psi-port",
    "sofa-proxy",
    "nihss-proxy",
    "birth-weight-percentile",
    "hunt-hess",
    "fisher-grade",
    "canadian-ct-head",
    "west-haven",
    "hepatic-encephalopathy-grade",
    "news2",
    "downes-score",
    "pews",
    "ciwa-ar",
    "perc-rule",
    "framingham-proxy",
    "ranson-criteria",
  ]);

  const patched = items
    .filter((c) => !drop.has(c.slug))
    .map((c) => {
      const fix = FORMULA_FIXES[c.slug];
      if (!fix) return c;
      return {
        ...c,
        ...fix.overrides,
        fields: fix.fields ?? c.fields,
        outputs: fix.outputs ?? c.outputs,
        validationExpr: fix.validationExpr ?? c.validationExpr,
        validationMessage: fix.validationMessage ?? c.validationMessage,
      };
    });

  for (const extra of EXTRA_CALCULATORS) {
    if (!bySlug.has(extra.slug)) {
      patched.push(extra);
    }
  }

  return patched;
}

type Fix = {
  overrides?: Partial<SeedCalculator>;
  fields?: SeedFieldRef[];
  outputs?: SeedOutput[];
  validationExpr?: string;
  validationMessage?: string;
};

const FORMULA_FIXES: Record<string, Fix> = {
  "kt-v-dialysis": {
    outputs: [
      out(
        "Kt/V",
        "",
        "-log(urea_post / urea_pre - 0.008 * hours) + (4 - 3.5 * urea_post / urea_pre) * ultrafiltration / weight_kg",
        2,
      ),
    ],
  },
  qsofa: {
    fields: [{ shared: "systolic-bp" }, { shared: "respiratory-rate" }, { shared: "gcs" }],
    outputs: [out("qSOFA score", "points", "(sbp <= 100 ? 1 : 0) + (rr >= 22 ? 1 : 0) + (gcs < 15 ? 1 : 0)", 0)],
  },
  curb65: {
    fields: [
      { shared: "age-years" },
      { shared: "respiratory-rate" },
      { shared: "systolic-bp" },
      { shared: "diastolic-bp" },
      { shared: "bun" },
      sel(
        "confusion",
        "New confusion",
        [
          { label: "No", value: 0 },
          { label: "Yes", value: 1 },
        ],
        0,
      ),
    ],
    outputs: [
      out(
        "CURB-65 score",
        "points",
        "(age >= 65 ? 1 : 0) + confusion + (bun > 19 ? 1 : 0) + (rr >= 30 ? 1 : 0) + (sbp < 90 or dbp <= 60 ? 1 : 0)",
        0,
      ),
    ],
  },
  "wells-pe": {
    overrides: {
      name: "Wells Score for Pulmonary Embolism",
      description: "Pretest probability for pulmonary embolism using the Wells criteria.",
    },
    fields: [
      sel("pe_likely", "PE more likely than alternative diagnosis", [
        { label: "No", value: 0 },
        { label: "Yes", value: 3 },
      ], 0),
      sel("hemoptysis", "Hemoptysis", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("immobilization", "Immobilization or surgery in prior 4 weeks", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1.5 },
      ], 0),
      sel("prior_dvt_pe", "Previous DVT or PE", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1.5 },
      ], 0),
      sel("tachycardia", "Heart rate > 100 bpm", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1.5 },
      ], 0),
    ],
    outputs: [out("Wells PE score", "points", "pe_likely + hemoptysis + immobilization + prior_dvt_pe + tachycardia", 1)],
  },
  "glasgow-blatchford": {
    fields: [
      { shared: "hemoglobin" },
      { shared: "systolic-bp" },
      { shared: "heart-rate" },
      { shared: "bun" },
      sel("melena", "Melena", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("syncope", "Syncope", [
        { label: "No", value: 0 },
        { label: "Yes", value: 2 },
      ], 0),
      sel("hepatic", "Hepatic disease history", [
        { label: "No", value: 0 },
        { label: "Yes", value: 2 },
      ], 0),
      sel("cardiac_fail", "Cardiac failure", [
        { label: "No", value: 0 },
        { label: "Yes", value: 2 },
      ], 0),
    ],
    outputs: [
      out(
        "Glasgow-Blatchford score",
        "points",
        "(hb < 12 ? 1 : 0) + (hb < 10 ? 1 : 0) + (sbp < 100 ? 1 : 0) + (sbp < 90 ? 1 : 0) + (heart_rate >= 100 ? 1 : 0) + (bun >= 70 ? 6 : bun >= 28 ? 4 : bun >= 22.4 ? 3 : bun >= 18.2 ? 2 : 0) + melena + syncope + hepatic + cardiac_fail",
        0,
      ),
    ],
  },
  "child-pugh": {
    fields: [
      { shared: "total-bilirubin" },
      { shared: "albumin" },
      { shared: "inr" },
      sel("ascites", "Ascites", [
        { label: "None", value: 1 },
        { label: "Mild", value: 2 },
        { label: "Moderate/severe", value: 3 },
      ], 1),
      sel("encephalopathy", "Encephalopathy", [
        { label: "None", value: 1 },
        { label: "Grade I–II", value: 2 },
        { label: "Grade III–IV", value: 3 },
      ], 1),
    ],
    outputs: [
      out(
        "Child-Pugh score",
        "points",
        "(bilirubin < 2 ? 1 : bilirubin >= 2 and bilirubin <= 3 ? 2 : 3) + (albumin > 3.5 ? 1 : albumin >= 2.8 and albumin <= 3.5 ? 2 : 3) + (inr < 1.7 ? 1 : inr >= 1.7 and inr <= 2.3 ? 2 : 3) + ascites + encephalopathy",
        0,
      ),
    ],
  },
  "ranson-score": {
    fields: [
      { shared: "age-years" },
      { shared: "wbc" },
      sel("glucose_high", "Glucose > 200 mg/dL", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("ldh_high", "LDH > 350 U/L", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("ast_high", "AST > 250 U/L", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("hct_drop", "Hematocrit fall > 10%", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("bun_rise", "BUN rise > 5 mg/dL", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("calcium_low", "Calcium < 8 mg/dL", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("pao2_low", "PaO₂ < 60 mmHg", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("base_deficit", "Base deficit > 4 mEq/L", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("fluid_sequestration", "Fluid sequestration > 6 L", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
    ],
    outputs: [
      out(
        "Ranson score (48 h)",
        "points",
        "(age > 55 ? 1 : 0) + (wbc > 16 ? 1 : 0) + glucose_high + ldh_high + ast_high + hct_drop + bun_rise + calcium_low + pao2_low + base_deficit + fluid_sequestration",
        0,
      ),
    ],
  },
  bisap: {
    fields: [
      { shared: "age-years" },
      { shared: "wbc" },
      { shared: "glucose" },
      sel("pleural", "Pleural effusion on imaging", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("impaired", "Impaired mental status", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
    ],
    outputs: [
      out(
        "BISAP score",
        "points",
        "(age > 60 ? 1 : 0) + impaired + pleural + (glucose > 200 ? 1 : 0) + (wbc > 12 ? 1 : 0)",
        0,
      ),
    ],
  },
  abcd2: {
    fields: [
      { shared: "age-years" },
      { shared: "systolic-bp" },
      { shared: "diastolic-bp" },
      sel("clinical", "Clinical features", [
        { label: "Unilateral weakness", value: 2 },
        { label: "Speech disturbance without weakness", value: 1 },
        { label: "Other symptoms", value: 0 },
      ], 0),
      sel("duration", "Symptom duration", [
        { label: "< 10 minutes", value: 0 },
        { label: "10–59 minutes", value: 1 },
        { label: "≥ 60 minutes", value: 2 },
      ], 0),
      sel("diabetes", "Diabetes history", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
    ],
    outputs: [
      out(
        "ABCD² score",
        "points",
        "(age >= 60 ? 1 : 0) + clinical + duration + diabetes + (sbp >= 140 or dbp >= 90 ? 1 : 0)",
        0,
      ),
    ],
  },
  "has-bled": {
    fields: [
      sel("hypertension", "Uncontrolled hypertension", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("renal", "Abnormal renal function", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("liver", "Abnormal liver function", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("stroke", "Prior stroke", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("bleeding", "Prior major bleeding", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("labile_inr", "Labile INR on warfarin", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("elderly", "Age > 65", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("drugs", "Concomitant antiplatelet/NSAID", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("alcohol", "Excess alcohol use", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
    ],
    outputs: [
      out(
        "HAS-BLED score",
        "points",
        "hypertension + renal + liver + stroke + bleeding + labile_inr + elderly + drugs + alcohol",
        0,
      ),
    ],
  },
  "cha2ds2-vasc": {
    fields: [
      sel("chf", "Congestive heart failure", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("hypertension", "Hypertension", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("diabetes", "Diabetes mellitus", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("stroke", "Prior stroke/TIA/thromboembolism", [
        { label: "No", value: 0 },
        { label: "Yes", value: 2 },
      ], 0),
      sel("vascular", "Vascular disease", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      { shared: "age-years" },
      { shared: "sex-mf" },
    ],
    outputs: [
      out(
        "CHA₂DS₂-VASc score",
        "points",
        "chf + hypertension + (age >= 75 ? 2 : age >= 65 ? 1 : 0) + diabetes + stroke + vascular + (sex == 0 ? 1 : 0)",
        0,
      ),
    ],
  },
  "wells-dvt": {
    fields: [
      sel("cancer", "Active cancer", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("paralysis", "Paralysis or recent plaster", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("bedridden", "Bedridden > 3 days or major surgery < 12 weeks", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("tenderness", "Localized tenderness along deep veins", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("swelling", "Entire leg swelling", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("calf", "Calf swelling > 3 cm vs other leg", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("pitting", "Pitting edema confined to symptomatic leg", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("collateral", "Collateral superficial veins", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("alternative", "Alternative diagnosis as likely as DVT", [
        { label: "No", value: 0 },
        { label: "Yes", value: -2 },
      ], 0),
    ],
    outputs: [
      out(
        "Wells DVT score",
        "points",
        "cancer + paralysis + bedridden + tenderness + swelling + calf + pitting + collateral + alternative",
        0,
      ),
    ],
  },
  "geneva-pe": {
    fields: [
      { shared: "age-years" },
      sel("prior_dvt", "Previous DVT/PE", [
        { label: "No", value: 0 },
        { label: "Yes", value: 3 },
      ], 0),
      sel("surgery", "Surgery or fracture in past month", [
        { label: "No", value: 0 },
        { label: "Yes", value: 2 },
      ], 0),
      sel("malignancy", "Active malignancy", [
        { label: "No", value: 0 },
        { label: "Yes", value: 2 },
      ], 0),
      sel("hemoptysis", "Hemoptysis", [
        { label: "No", value: 0 },
        { label: "Yes", value: 2 },
      ], 0),
      sel("unilateral_pain", "Unilateral lower limb pain", [
        { label: "No", value: 0 },
        { label: "Yes", value: 3 },
      ], 0),
      sel("tenderness", "Pain on palpation and unilateral edema", [
        { label: "No", value: 0 },
        { label: "Yes", value: 4 },
      ], 0),
    ],
    outputs: [
      out(
        "Geneva score",
        "points",
        "(age > 65 ? 1 : 0) + prior_dvt + surgery + malignancy + hemoptysis + unilateral_pain + tenderness",
        0,
      ),
    ],
  },
  "ich-volume": {
    fields: [
      num("a", "Length A (cm)", 0.1, 15, 4),
      num("b", "Length B (cm)", 0.1, 15, 3),
      num("c", "Length C (cm)", 0.1, 15, 3),
    ],
    outputs: [out("ICH volume", "mL", "a * b * c / 2", 1)],
  },
  "tls-risk": {
    fields: [
      { shared: "potassium" },
      { shared: "phosphate" },
      { shared: "uric-acid" },
      { shared: "serum-creatinine" },
    ],
    outputs: [
      out(
        "TLS risk points",
        "points",
        "(k >= 6 ? 1 : 0) + (phosphate >= 6.5 ? 1 : 0) + (uric_acid >= 10 ? 1 : 0) + (scr >= 1.5 ? 1 : 0)",
        0,
      ),
    ],
  },
  "ventilator-tidal-volume": {
    fields: [{ shared: "height-cm" }, { shared: "sex-mf" }],
    outputs: [
      out(
        "Predicted tidal volume",
        "mL",
        "6 * (sex == 1 ? 50 + 0.91 * (height_cm - 152.4) : 45.5 + 0.91 * (height_cm - 152.4))",
        0,
      ),
    ],
  },
  "adjusted-body-weight": {
    fields: [{ shared: "height-cm" }, { shared: "weight-kg" }, { shared: "sex-mf" }],
    outputs: [
      out(
        "Adjusted body weight",
        "kg",
        "(sex == 1 ? 50 : 45.5) + 2.3 * max(height_cm / 2.54 - 60, 0) + 0.4 * (weight_kg - ((sex == 1 ? 50 : 45.5) + 2.3 * max(height_cm / 2.54 - 60, 0)))",
        1,
      ),
    ],
    validationExpr: "weight_kg > ((sex == 1 ? 50 : 45.5) + 2.3 * max(height_cm / 2.54 - 60, 0))",
    validationMessage: "Adjusted body weight applies when actual weight exceeds ideal body weight.",
  },
};

const EXTRA_CALCULATORS: SeedCalculator[] = [
  calc(
    "egfr-ckd-epi",
    "eGFR (CKD-EPI simplified)",
    "nephrology",
    "CKD-EPI creatinine equation (simplified)",
    "Estimated glomerular filtration rate using creatinine, age, and sex.",
    [{ shared: "age-years" }, { shared: "sex-mf" }, { shared: "serum-creatinine" }],
    [
      out(
        "eGFR",
        "mL/min/1.73m²",
        "sex == 1 ? 142 * min(scr / 0.9, 1) ^ -0.302 * max(scr / 0.9, 1) ^ -1.2 * 0.9938 ^ age : 142 * min(scr / 0.7, 1) ^ -0.241 * max(scr / 0.7, 1) ^ -1.2 * 0.9938 ^ age * 1.012",
        0,
      ),
    ],
  ),
  calc(
    "serum-osmolality",
    "Serum Osmolality (calculated)",
    "clinical-laboratory",
    "2×Na + glucose/18 + BUN/2.8",
    "Estimated serum osmolality from routine chemistry.",
    [{ shared: "sodium" }, { shared: "glucose" }, { shared: "bun" }],
    [out("Calculated osmolality", "mOsm/kg", "2 * na + glucose / 18 + bun / 2.8", 0)],
  ),
  calc(
    "parkland-fluids-hourly",
    "Parkland Fluids (first 8 h)",
    "emergency-critical-care",
    "Half of 24h volume in first 8 hours",
    "First-phase burn resuscitation rate after Parkland formula.",
    [{ shared: "weight-kg" }, num("tbsa", "TBSA burn (%)", 1, 100, 20)],
    [out("Fluid rate (8 h)", "mL/hr", "4 * weight_kg * tbsa / 2 / 8", 0)],
  ),
  calc(
    "ldl-martin-hopkins",
    "LDL (when TG elevated)",
    "clinical-laboratory",
    "Non-HDL based estimate",
    "Approximate LDL when triglycerides are high (educational).",
    [
      num("total_chol", "Total cholesterol (mg/dL)", 100, 400, 200),
      num("hdl", "HDL cholesterol (mg/dL)", 20, 120, 55),
    ],
    [out("Non-HDL cholesterol", "mg/dL", "total_chol - hdl", 0)],
  ),
  calc(
    "heart-score",
    "HEART Score",
    "cardiology",
    "Chest pain risk stratification",
    "Emergency department chest pain risk score.",
    [
      sel("history", "History", [
        { label: "Slightly suspicious", value: 0 },
        { label: "Moderately suspicious", value: 1 },
        { label: "Highly suspicious", value: 2 },
      ], 1),
      sel("ecg", "ECG", [
        { label: "Normal", value: 0 },
        { label: "Non-specific changes", value: 1 },
        { label: "Significant ST deviation", value: 2 },
      ], 0),
      sel("age_band", "Age", [
        { label: "< 45", value: 0 },
        { label: "45–64", value: 1 },
        { label: "≥ 65", value: 2 },
      ], 1),
      sel("risk_factors", "Risk factors", [
        { label: "None", value: 0 },
        { label: "1–2 factors", value: 1 },
        { label: "≥ 3 or prior CAD", value: 2 },
      ], 1),
      sel("troponin", "Troponin", [
        { label: "≤ normal limit", value: 0 },
        { label: "1–3× normal", value: 1 },
        { label: "> 3× normal", value: 2 },
      ], 0),
    ],
    [out("HEART score", "points", "history + ecg + age_band + risk_factors + troponin", 0)],
  ),
  calc(
    "grace-score-simplified",
    "GRACE Score (simplified)",
    "cardiology",
    "ACS mortality risk",
    "Simplified acute coronary syndrome risk estimate.",
    [
      { shared: "age-years" },
      { shared: "systolic-bp" },
      { shared: "heart-rate" },
      { shared: "serum-creatinine" },
      sel("killip", "Killip class", [
        { label: "I", value: 0 },
        { label: "II", value: 20 },
        { label: "III", value: 30 },
        { label: "IV", value: 40 },
      ], 0),
      sel("cardiac_arrest", "Cardiac arrest at admission", [
        { label: "No", value: 0 },
        { label: "Yes", value: 30 },
      ], 0),
      sel("st_deviation", "ST deviation", [
        { label: "No", value: 0 },
        { label: "Yes", value: 20 },
      ], 0),
      sel("elevated_enzymes", "Elevated cardiac enzymes", [
        { label: "No", value: 0 },
        { label: "Yes", value: 15 },
      ], 0),
    ],
    [
      out(
        "GRACE points (approx.)",
        "points",
        "(age > 75 ? 40 : age > 65 ? 25 : age > 55 ? 15 : 0) + (sbp < 80 ? 50 : sbp < 100 ? 40 : sbp < 120 ? 25 : sbp < 140 ? 10 : 0) + (heart_rate > 110 ? 25 : heart_rate > 90 ? 15 : heart_rate < 50 ? 10 : 0) + (scr > 2 ? 25 : scr > 1.5 ? 15 : scr > 1.2 ? 5 : 0) + killip + cardiac_arrest + st_deviation + elevated_enzymes",
        0,
      ),
    ],
  ),
  calc(
    "timi-stemi",
    "TIMI Risk Score (STEMI)",
    "cardiology",
    "STEMI mortality risk",
    "Thrombolysis in myocardial infarction score for STEMI.",
    [
      { shared: "age-years" },
      { shared: "systolic-bp" },
      { shared: "heart-rate" },
      sel("diabetes", "Diabetes or hypertension or angina", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("killip", "Killip class II–IV", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("weight_low", "Weight < 67 kg", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("anterior", "Anterior ST elevation or LBBB", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
      sel("time", "Time to treatment > 4 h", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
    ],
    [
      out(
        "TIMI STEMI score",
        "points",
        "(age >= 75 ? 3 : age >= 65 ? 2 : 0) + (sbp < 100 ? 3 : 0) + (heart_rate > 100 ? 2 : 0) + diabetes + killip + weight_low + anterior + time",
        0,
      ),
    ],
  ),
  calc(
    "framingham-risk-points",
    "Framingham Risk Points (simplified)",
    "cardiology",
    "10-year CVD risk points",
    "Educational Framingham-style point tally using major risk factors.",
    [
      { shared: "age-years" },
      { shared: "sex-mf" },
      sel("smoker", "Current smoker", [
        { label: "No", value: 0 },
        { label: "Yes", value: 2 },
      ], 0),
      sel("diabetes", "Diabetes", [
        { label: "No", value: 0 },
        { label: "Yes", value: 2 },
      ], 0),
      num("total_chol", "Total cholesterol (mg/dL)", 100, 400, 200),
      num("hdl", "HDL cholesterol (mg/dL)", 20, 120, 55),
      { shared: "systolic-bp" },
      sel("treated_bp", "On antihypertensive therapy", [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ], 0),
    ],
    [
      out(
        "Risk points",
        "points",
        "(age >= 70 ? 8 : age >= 60 ? 6 : age >= 50 ? 4 : age >= 40 ? 2 : 0) + smoker + diabetes + (total_chol >= 240 ? 2 : total_chol >= 200 ? 1 : 0) + (hdl < 40 ? 2 : 0) + (sbp >= 160 ? 3 : sbp >= 140 ? 2 : sbp >= 130 ? 1 : 0) + treated_bp",
        0,
      ),
    ],
  ),
  calc(
    "pediatric-gcs",
    "Pediatric GCS (total)",
    "obstetrics-pediatrics",
    "GCS sum",
    "Pediatric Glasgow Coma Scale total from component scores.",
    [
      num("eye", "Eye response (1–4)", 1, 4, 4),
      num("verbal", "Verbal response (1–5)", 1, 5, 5),
      num("motor", "Motor response (1–6)", 1, 6, 6),
    ],
    [out("GCS total", "points", "eye + verbal + motor", 0)],
  ),
  calc(
    "peep-titration",
    "PEEP FiO₂ Table Estimate",
    "pulmonology",
    "ARDS PEEP/FiO₂",
    "Suggested PEEP level for a given FiO₂ (educational ARDSnet-style pairing).",
    [{ shared: "fio2-percent" }],
    [out("Suggested PEEP", "cmH₂O", "fio2 <= 30 ? 5 : fio2 <= 40 ? 8 : fio2 <= 50 ? 10 : fio2 <= 60 ? 12 : fio2 <= 70 ? 14 : 16", 0)],
  ),
  calc(
    "calcium-ionized-estimate",
    "Ionized Calcium Estimate",
    "clinical-laboratory",
    "From total calcium and albumin",
    "Estimated ionized calcium when direct measurement is unavailable.",
    [{ shared: "measured-calcium" }, { shared: "albumin" }],
    [out("Estimated ionized Ca", "mg/dL", "0.8 * measured_ca + 0.2 * (albumin - 4)", 2)],
  ),
  calc(
    "sodium-correction-rate",
    "Sodium Correction Rate",
    "nephrology",
    "Change per liter free water",
    "Expected sodium change per liter of free water infused.",
    [{ shared: "weight-kg" }, { shared: "sodium" }],
    [out("ΔNa per L free water", "mEq/L", "sodium / (0.6 * weight_kg + 1)", 2)],
  ),
  calc(
    "dka-anion-gap",
    "DKA Anion Gap",
    "endocrinology",
    "AG in hyperglycemia",
    "Anion gap using glucose and electrolytes in metabolic derangements.",
    [{ shared: "sodium" }, { shared: "chloride" }, { shared: "bicarbonate" }],
    [out("Anion gap", "mEq/L", "na - (cl + hco3)", 0)],
  ),
  calc(
    "insulin-sensitivity-factor",
    "Insulin Sensitivity Factor",
    "endocrinology",
    "1800 rule",
    "Estimated mg/dL drop per unit of rapid insulin.",
    [num("total_daily_insulin", "Total daily insulin (units)", 5, 200, 40)],
    [out("ISF", "mg/dL per unit", "1800 / total_daily_insulin", 0)],
    {
      validationExpr: "total_daily_insulin > 0",
      validationMessage: "Total daily insulin must be greater than zero.",
    },
  ),
  calc(
    "has-bled",
    "HAS-BLED Score",
    "cardiology",
    "Bleeding risk on anticoagulation",
    "Estimates major bleeding risk for patients on anticoagulation.",
    FORMULA_FIXES["has-bled"]!.fields!,
    FORMULA_FIXES["has-bled"]!.outputs!,
  ),
  calc(
    "cha2ds2-vasc",
    "CHA₂DS₂-VASc Score",
    "cardiology",
    "Stroke risk in atrial fibrillation",
    "Estimates stroke risk to guide anticoagulation discussions.",
    FORMULA_FIXES["cha2ds2-vasc"]!.fields!,
    FORMULA_FIXES["cha2ds2-vasc"]!.outputs!,
  ),
  calc(
    "wells-dvt",
    "Wells Score for DVT",
    "emergency-critical-care",
    "Wells criteria",
    "Pretest probability for lower-extremity deep vein thrombosis.",
    FORMULA_FIXES["wells-dvt"]!.fields!,
    FORMULA_FIXES["wells-dvt"]!.outputs!,
  ),
  calc(
    "geneva-pe",
    "Revised Geneva Score",
    "emergency-critical-care",
    "Geneva PE score",
    "Pulmonary embolism probability using the Geneva score.",
    FORMULA_FIXES["geneva-pe"]!.fields!,
    FORMULA_FIXES["geneva-pe"]!.outputs!,
  ),
  calc(
    "rcr-index",
    "Renal Resistive Index",
    "nephrology",
    "RRI = (PSV − EDV) / PSV",
    "Doppler renal resistive index for parenchymal disease assessment.",
    [
      num("psv", "Peak systolic velocity (cm/s)", 10, 200, 80),
      num("edv", "End-diastolic velocity (cm/s)", 0, 100, 20),
    ],
    [out("Resistive index", "", "(psv - edv) / psv", 2)],
    { validationExpr: "psv > 0", validationMessage: "Peak systolic velocity must be greater than zero." },
  ),
  calc(
    "fe-urea",
    "Fractional Excretion of Urea",
    "nephrology",
    "FEUrea",
    "Helps differentiate prerenal azotemia from acute tubular necrosis when diuretics were used.",
    [
      { shared: "bun" },
      { shared: "serum-creatinine" },
      num("urine_urea", "Urine urea (mg/dL)", 50, 1000, 300),
      num("urine_cr", "Urine creatinine (mg/dL)", 1, 300, 100),
    ],
    [out("FEUrea", "%", "100 * (urine_urea * scr) / (bun * urine_cr)", 1)],
  ),
  calc(
    "calcium-creatinine-clearance",
    "Creatinine Clearance (24h urine)",
    "nephrology",
    "UV/P",
    "Measured creatinine clearance from timed urine collection.",
    [
      num("urine_cr", "Urine creatinine (mg/dL)", 1, 300, 80),
      num("urine_volume_ml", "Urine volume (mL)", 100, 5000, 1500),
      num("collection_min", "Collection time (minutes)", 60, 2880, 1440),
      { shared: "serum-creatinine" },
    ],
    [out("CrCl", "mL/min", "urine_cr * urine_volume_ml / (scr * collection_min)", 0)],
  ),
];
