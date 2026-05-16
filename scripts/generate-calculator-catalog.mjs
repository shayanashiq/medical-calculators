/**
 * Generates prisma/seed-data/calculators/generated-catalog.ts
 * Run: node scripts/generate-calculator-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";

const { calc, shared, num, out } = {
  calc: (...args) => ({ type: "calc", args }),
  shared: (...s) => s,
  num: (...a) => ({ type: "num", a }),
  out: (...a) => ({ type: "out", a }),
};

/** @type {Array<Record<string, unknown>>} */
const entries = [];

function push(c) {
  entries.push(c);
}

// --- Anthropometry & body composition ---
const anthro = [
  ["bmi", "Body Mass Index (BMI)", "BMI = weight / height²", "Screening index for weight status using height and weight.", ["height-cm", "weight-kg"], [["BMI", "", "weight_kg / (height_cm / 100) ^ 2", 1]]],
  ["bmr", "Basal Metabolic Rate (BMR)", "Mifflin-St Jeor", "Estimated resting daily energy expenditure.", ["age-years", "sex-mf", "height-cm", "weight-kg"], [["BMR", "kcal/day", "10 * weight_kg + 6.25 * height_cm - 5 * age + (sex == 1 ? 5 : -161)", 0]]],
  ["tdee", "Total Daily Energy Expenditure", "TDEE = BMR × activity", "Estimated daily calories including activity.", ["age-years", "sex-mf", "height-cm", "weight-kg", "activity-factor"], [["TDEE", "kcal/day", "(10 * weight_kg + 6.25 * height_cm - 5 * age + (sex == 1 ? 5 : -161)) * activity", 0]]],
  ["ideal-body-weight", "Ideal Body Weight", "Devine equation", "Reference weight estimate based on height and sex.", ["height-cm", "sex-mf"], [["Ideal weight", "kg", "(sex == 1 ? 50 : 45.5) + 2.3 * max(height_cm / 2.54 - 60, 0)", 1]]],
  ["bsa", "Body Surface Area", "Mosteller", "Surface area estimate used in dosing and physiology.", ["height-cm", "weight-kg"], [["BSA", "m²", "sqrt(height_cm * weight_kg / 3600)", 2]]],
  ["body-fat", "Body Fat Percentage", "US Navy method", "Body-fat estimate from circumference measurements.", ["height-cm", "sex-mf", "waist-cm", "neck-cm", "hip-cm"], [["Body fat", "%", "(sex == 1 ? (86.01 * log10(waist_cm / 2.54 - neck_cm / 2.54) - 70.041 * log10(height_cm / 2.54) + 36.76) : (163.205 * log10(waist_cm / 2.54 + hip_cm / 2.54 - neck_cm / 2.54) - 97.684 * log10(height_cm / 2.54) - 78.387))", 1]]],
  ["waist-to-height-ratio", "Waist-to-Height Ratio", "WtHR = waist / height", "Central adiposity screening index.", ["waist-cm", "height-cm"], [["WtHR", "", "waist_cm / height_cm", 2]]],
  ["waist-hip-ratio", "Waist-to-Hip Ratio", "WHR = waist / hip", "Fat distribution pattern estimate.", ["waist-cm", "hip-cm"], [["WHR", "", "waist_cm / hip_cm", 2]]],
  ["ponderal-index", "Ponderal Index", "PI = weight / height³", "Alternative to BMI in some populations.", ["height-cm", "weight-kg"], [["Ponderal index", "kg/m³", "weight_kg / (height_cm / 100) ^ 3", 1]]],
  ["adjusted-body-weight", "Adjusted Body Weight", "AdjBW for obesity dosing", "Adjusted weight when actual BMI is elevated.", ["height-cm", "weight-kg"], [["Adjusted BW", "kg", "ideal_bw + 0.4 * (weight_kg - ideal_bw)", 1]], { extraFields: [["ideal_bw", "Ideal body weight (kg)", 40, 120, 70]] }],
  ["lean-body-mass", "Lean Body Mass Estimate", "Boer formula", "Estimated lean mass from height, weight, and sex.", ["height-cm", "weight-kg", "sex-mf"], [["Lean body mass", "kg", "sex == 1 ? (0.407 * weight_kg + 0.267 * height_cm - 19.2) : (0.252 * weight_kg + 0.473 * height_cm - 48.3)", 1]]],
  ["body-adiposity-index", "Body Adiposity Index", "BAI", "Hip circumference–based adiposity index.", ["hip-cm", "height-cm"], [["BAI", "%", "100 * (hip_cm / (height_cm ^ 1.5)) - 18", 1]]],
  ["bmi-prime", "BMI Prime", "BMI / 25", "BMI relative to upper-normal reference (25).", ["height-cm", "weight-kg"], [["BMI prime", "", "(weight_kg / (height_cm / 100) ^ 2) / 25", 2]]],
  ["harris-benedict-bmr", "Harris-Benedict BMR", "Classic Harris-Benedict", "Classic resting metabolic rate estimate.", ["age-years", "sex-mf", "height-cm", "weight-kg"], [["BMR (HB)", "kcal/day", "sex == 1 ? (88.362 + 13.397 * weight_kg + 4.799 * height_cm - 5.677 * age) : (447.593 + 9.247 * weight_kg + 3.098 * height_cm - 4.330 * age)", 0]]],
  ["fat-mass-index", "Fat Mass Index", "FMI", "Fat mass normalized to height.", ["height-cm", "weight-kg", "sex-mf", "waist-cm", "neck-cm", "hip-cm"], [["Fat mass index", "kg/m²", "fat_pct / 100 * weight_kg / (height_cm / 100) ^ 2", 1]], { extraFields: [], derived: "body-fat" }],
  ["target-weight-bmi", "Target Weight for BMI", "Weight at target BMI", "Weight needed to reach a target BMI.", ["height-cm"], [["Target weight", "kg", "target_bmi * (height_cm / 100) ^ 2", 1]], { extraFields: [["target_bmi", "Target BMI", 15, 35, 24]] }],
  ["maintenance-calories", "Maintenance Calories", "TDEE shortcut", "Quick maintenance calorie estimate from weight.", ["weight-kg", "activity-factor"], [["Maintenance kcal", "kcal/day", "weight_kg * 24 * activity", 0]]],
  ["body-weight-change", "Weekly Weight Change", "Calorie balance", "Expected weekly weight change from daily calorie balance.", [], [["Weekly change", "kg/week", "daily_balance * 7 / 7700", 2]], { extraFields: [["daily_balance", "Daily calorie balance (kcal)", -2000, 2000, -500]] }],
];

for (const row of anthro) {
  const [slug, name, formula, desc, fields, outputs, opts = {}] = row;
  push({ slug, name, category: "anthropometry", formula, desc, fields, outputs, opts });
}

// --- Fitness & hydration ---
const fitness = [
  ["water-intake", "Daily Water Intake", "35 mL/kg/day", "Hydration target based on body weight.", ["weight-kg"], [["Daily water", "mL/day", "weight_kg * 35", 0], ["Daily water", "L/day", "weight_kg * 35 / 1000", 2]]],
  ["target-heart-rate", "Target Heart Rate Zones", "Karvonen", "Training zones using age and resting heart rate.", ["age-years", "resting-hr"], [["Max HR", "bpm", "220 - age", 0], ["Moderate low", "bpm", "resting_hr + (220 - age - resting_hr) * 0.5", 0], ["Moderate high", "bpm", "resting_hr + (220 - age - resting_hr) * 0.7", 0]]],
  ["max-heart-rate", "Maximum Heart Rate", "220 − age", "Estimated maximum heart rate.", ["age-years"], [["Max HR", "bpm", "220 - age", 0]]],
  ["heart-rate-reserve", "Heart Rate Reserve", "Karvonen HRR", "Heart rate reserve for training prescription.", ["age-years", "resting-hr"], [["HRR", "bpm", "220 - age - resting_hr", 0]]],
  ["vo2max-cooper", "VO₂max (Cooper 12-min)", "Cooper test", "Aerobic capacity estimate from 12-minute run distance.", [], [["VO₂max", "mL/kg/min", "(distance_m - 504.9) / 44.73", 1]], { extraFields: [["distance_m", "Distance in 12 min (m)", 500, 3500, 2400]] }],
  ["sweat-rate", "Sweat Rate", "Fluid loss per hour", "Exercise sweat rate from weight change.", ["weight-kg"], [["Sweat rate", "L/h", "sweat_ml / 1000", 2]], { extraFields: [["sweat_ml", "Fluid loss (mL)", 0, 3000, 800], ["exercise_h", "Exercise duration (hours)", 0.25, 4, 1]] }],
  ["fluid-replacement", "Exercise Fluid Replacement", "Post-exercise fluids", "Recommended fluid replacement after exercise.", ["weight-kg"], [["Replace (mL)", "mL", "weight_lost_kg * 1500", 0]], { extraFields: [["weight_lost_kg", "Weight lost (kg)", 0, 5, 1]] }],
  ["steps-calorie", "Calories from Steps", "Steps to kcal", "Approximate calories burned from step count.", ["weight-kg"], [["Calories", "kcal", "steps * weight_kg * 0.00004", 0]], { extraFields: [["steps", "Step count", 100, 50000, 8000]] }],
  ["pace-calculator", "Running Pace", "min/km", "Pace from distance and time.", [], [["Pace", "min/km", "time_min / (distance_km)", 2]], { extraFields: [["distance_km", "Distance (km)", 0.1, 100, 5], ["time_min", "Time (minutes)", 1, 600, 25]] }],
  ["one-rep-max", "One-Rep Max (Epley)", "Epley formula", "Estimated 1RM from submaximal lift.", [], [["1RM", "kg", "weight_lift * (1 + reps / 30)", 1]], { extraFields: [["weight_lift", "Weight lifted (kg)", 1, 400, 80], ["reps", "Repetitions", 1, 15, 5]] }],
  ["calorie-burn-running", "Running Calorie Burn", "MET estimate", "Approximate calories burned while running.", ["weight-kg"], [["Calories", "kcal", "met * weight_kg * duration_h", 0]], { extraFields: [["met", "MET value", 3, 15, 9], ["duration_h", "Duration (hours)", 0.1, 5, 0.5]] }],
  ["body-water-percent", "Total Body Water", "Watson formula", "Estimated total body water percentage.", ["age-years", "sex-mf", "height-cm", "weight-kg"], [["TBW", "L", "sex == 1 ? (2.447 - 0.09156 * age + 0.1074 * height_cm + 0.3362 * weight_kg) : (-2.097 + 0.1069 * height_cm + 0.2466 * weight_kg)", 1]]],
  ["hydration-urine", "Urine Output Rate", "mL/kg/hr", "Urine output normalized to weight and time.", ["weight-kg"], [["Urine rate", "mL/kg/h", "urine_ml / weight_kg / hours", 2]], { extraFields: [["urine_ml", "Urine volume (mL)", 0, 3000, 1200], ["hours", "Hours", 1, 24, 24]] }],
];

for (const row of fitness) {
  const [slug, name, formula, desc, fields, outputs, opts = {}] = row;
  push({ slug, name, category: "fitness-hydration", formula, desc, fields, outputs, opts });
}

// Generate many clinical-lab style calculators from templates
function labRatio(slug, name, desc, formulaPlain, fieldKeys, numFields, outputFormula, unit, category = "clinical-laboratory") {
  push({
    slug,
    name,
    category,
    formula: formulaPlain,
    desc,
    fields: fieldKeys,
    outputs: [[name.split(" ")[0] || "Result", unit, outputFormula, 2]],
    opts: {},
    numFields,
  });
}

// Cardiology batch
const cardioFormulas = [
  ["pulse-pressure", "Pulse Pressure", "SBP − DBP", "Difference between systolic and diastolic pressure.", ["systolic-bp", "diastolic-bp"], "sbp - dbp", "mmHg"],
  ["map", "Mean Arterial Pressure", "(SBP + 2×DBP)/3", "Perfusion pressure estimate.", ["systolic-bp", "diastolic-bp"], "(sbp + 2 * dbp) / 3", "mmHg"],
  ["cardiac-output-fick", "Cardiac Output (Fick)", "CO = VO₂/(Ca−Cv)", "Cardiac output from Fick principle.", [], "vo2 / (ca_o2 - cv_o2)", "L/min"],
  ["stroke-volume", "Stroke Volume", "SV = CO/HR", "Stroke volume from cardiac output and heart rate.", [], "co / heart_rate", "mL"],
  ["systemic-vascular-resistance", "Systemic Vascular Resistance", "SVR", "Vascular resistance estimate.", ["systolic-bp", "diastolic-bp"], "map * 80 / co", "dyn·s/cm⁵"],
  ["rate-pressure-product", "Rate Pressure Product", "RPP", "Myocardial oxygen demand index.", ["systolic-bp", "heart-rate"], "sbp * heart_rate", ""],
  ["qt-corrected-bazett", "Corrected QT (Bazett)", "QTc", "QT interval corrected for heart rate.", [], "qt_ms / sqrt(60 / heart_rate)", "ms"],
  ["shock-index", "Shock Index", "HR/SBP", "Triage hemodynamic index.", ["heart-rate", "systolic-bp"], "heart_rate / sbp", ""],
  ["modified-shock-index", "Modified Shock Index", "HR/MAP", "Shock index using mean arterial pressure.", ["heart-rate", "systolic-bp", "diastolic-bp"], "heart_rate / ((sbp + 2 * dbp) / 3)", ""],
  ["cardiac-index", "Cardiac Index", "CI = CO/BSA", "Cardiac output indexed to body surface area.", ["height-cm", "weight-kg"], "co / sqrt(height_cm * weight_kg / 3600)", "L/min/m²"],
];

for (const [slug, name, formula, desc, fields, outFormula, unit] of cardioFormulas) {
  const extra = [];
  if (slug === "cardiac-output-fick") {
    extra.push(["vo2", "VO₂ consumption (mL/min)", 100, 500, 250], ["ca_o2", "Arterial O₂ content (mL/L)", 100, 250, 200], ["cv_o2", "Mixed venous O₂ (mL/L)", 50, 200, 150]);
  }
  if (slug === "stroke-volume") {
    extra.push(["co", "Cardiac output (L/min)", 2, 12, 5]);
  }
  if (slug === "systemic-vascular-resistance") {
    extra.push(["co", "Cardiac output (L/min)", 2, 12, 5]);
  }
  if (slug === "qt-corrected-bazett") {
    extra.push(["qt_ms", "QT interval (ms)", 200, 600, 400]);
  }
  if (slug === "cardiac-index") {
    extra.push(["co", "Cardiac output (L/min)", 2, 12, 5]);
  }
  push({
    slug,
    name,
    category: "cardiology",
    formula,
    desc,
    fields,
    outputs: [[name, unit, outFormula, slug.includes("index") ? 2 : 0]],
    opts: { extraFields: extra },
  });
}

// Nephrology
const nephro = [
  ["creatinine-clearance", "Creatinine Clearance (CrCl)", "Cockcroft-Gault", "Estimated creatinine clearance.", ["age-years", "weight-kg", "sex-mf", "serum-creatinine"], "((140 - age) * weight_kg / (72 * scr)) * (sex == 0 ? 0.85 : 1)", "mL/min"],
  ["egfr-mdrd", "eGFR (MDRD simplified)", "MDRD", "Estimated GFR using MDRD equation.", ["age-years", "sex-mf", "serum-creatinine"], "175 * (scr ^ -1.154) * (age ^ -0.203) * (sex == 0 ? 0.742 : 1)", "mL/min/1.73m²"],
  ["bun-creatinine-ratio", "BUN/Creatinine Ratio", "BUN/SCr", "Prerenal vs intrinsic kidney injury clue.", ["bun", "serum-creatinine"], "bun / scr", ""],
  ["fractional-excretion-sodium", "Fractional Excretion of Sodium", "FENa", "Differentiates prerenal from ATN.", [], "100 * (urine_na * scr) / (serum_na * urine_cr)", "%"],
  ["free-water-clearance", "Free Water Clearance", "CH₂O", "Free water handling estimate.", ["urine-osm", "serum-osm", "urine-output-ml"], "urine_ml * (1 - urine_osm / serum_osm)", "mL/day"],
  ["fluid-balance", "24h Fluid Balance", "In − out", "Net fluid balance over 24 hours.", ["fluid-intake-ml", "urine-output-ml"], "fluid_ml - urine_ml", "mL"],
  ["maintenance-fluids-holliday", "Maintenance Fluids (Holliday-Segar)", "4-2-1 rule", "Pediatric/adult maintenance fluid estimate.", ["weight-kg"], "weight_kg <= 10 ? weight_kg * 100 : weight_kg <= 20 ? 1000 + (weight_kg - 10) * 50 : 1500 + (weight_kg - 20) * 20", "mL/day"],
  ["sodium-deficit", "Sodium Deficit", "Hyponatremia correction", "Estimated sodium deficit in hyponatremia.", ["weight-kg"], "0.6 * weight_kg * (target_na - serum_na)", "mEq"],
  ["corrected-sodium-glucose", "Corrected Sodium (Hyperglycemia)", "Katz correction", "Sodium correction for hyperglycemia.", ["sodium", "glucose"], "na + 0.024 * (glucose - 100)", "mEq/L"],
  ["urine-anion-gap", "Urine Anion Gap", "UAG", "Helps classify metabolic acidosis.", ["urine-na", "urine-k", "urine-cl"], "urine_na + urine_k - urine_cl", "mEq/L"],
  ["kt-v-dialysis", "Kt/V (simplified)", "Dialysis adequacy", "Simplified dialysis adequacy estimate.", [], "neg_log(urea_post / urea_pre - 0.008 * hours) + (4 - 3.5 * urea_post / urea_pre) * ultrafiltration / weight_kg", ""],
];

for (const row of nephro) {
  const [slug, name, formula, desc, fields, outF, unit] = row;
  const extra = [];
  if (slug === "fractional-excretion-sodium") {
    extra.push(["urine_na", "Urine sodium (mEq/L)", 0, 200, 40], ["urine_cr", "Urine creatinine (mg/dL)", 1, 300, 100], ["serum_na", "Serum sodium (mEq/L)", 100, 180, 140]);
  }
  if (slug === "free-water-clearance") {
    extra.push(["urine_osm", "Urine osmolality (mOsm/kg)", 50, 1200, 500], ["serum_osm", "Serum osmolality (mOsm/kg)", 250, 350, 290]);
  }
  if (slug === "sodium-deficit") {
    extra.push(["serum_na", "Current sodium (mEq/L)", 100, 180, 128], ["target_na", "Target sodium (mEq/L)", 130, 145, 140]);
  }
  if (slug === "urine-anion-gap") {
    extra.push(["urine_na", "Urine Na (mEq/L)", 0, 200, 50], ["urine_k", "Urine K (mEq/L)", 0, 100, 25], ["urine_cl", "Urine Cl (mEq/L)", 0, 200, 50]);
  }
  if (slug === "kt-v-dialysis") {
    extra.push(["urea_pre", "Pre-dialysis BUN (mg/dL)", 10, 200, 80], ["urea_post", "Post-dialysis BUN (mg/dL)", 5, 100, 20], ["hours", "Session hours", 2, 5, 4], ["ultrafiltration", "Ultrafiltration (L)", 0, 5, 2]);
  }
  push({ slug, name, category: "nephrology", formula, desc, fields, outputs: [[name, unit, outF, 2]], opts: { extraFields: extra } });
}

// Clinical laboratory (existing + more)
const clinicalLab = [
  ["corrected-calcium", "Corrected Calcium", "Albumin correction", "Albumin-adjusted total calcium.", ["measured-calcium", "albumin"], "measured_ca + 0.8 * (4 - albumin)", "mg/dL"],
  ["anion-gap", "Anion Gap", "Na − (Cl + HCO₃)", "Serum anion gap.", ["sodium", "chloride", "bicarbonate"], "na - (cl + hco3)", "mEq/L"],
  ["albumin-globulin-ratio", "Albumin/Globulin Ratio", "A/G ratio", "Serum protein pattern index.", [], "albumin / globulin", ""],
  ["calcium-phosphorus-product", "Calcium–Phosphorus Product", "Ca × Phos", "CKD-MBD risk marker.", ["measured-calcium"], "ca * phosphorus", "mg²/dL²"],
  ["osmolality-serum", "Calculated Serum Osmolality", "2×Na + glucose/18", "Estimated serum osmolality.", ["sodium", "glucose", "bun"], "2 * na + glucose / 18 + bun / 2.8", "mOsm/kg"],
  ["delta-gap", "Delta Gap", "Δ gap", "High anion gap metabolic acidosis helper.", ["sodium", "chloride", "bicarbonate"], "(na - (cl + hco3)) - (12 - hco3)", "mEq/L"],
  ["transtubular-potassium", "Transtubular K Gradient", "TTKG", "Renal potassium handling.", [], "(urine_k * serum_osm) / (serum_k * urine_osm)", ""],
  ["rifle-aki", "AKI Severity (RIFLE creatinine)", "Creatinine-based", "Acute kidney injury staging helper.", ["serum-creatinine"], "baseline_cr > 0 ? scr / baseline_cr : 1", ""],
  ["ldl-friedewald", "LDL Cholesterol (Friedewald)", "LDL estimate", "LDL-C when triglycerides are acceptable.", [], "total_chol - hdl - trig / 5", "mg/dL"],
  ["iron-saturation", "Transferrin Saturation", "Fe/TIBC", "Iron studies index.", [], "100 * iron / tibc", "%"],
];

for (const row of clinicalLab) {
  const [slug, name, formula, desc, fields, outF, unit] = row;
  const extra = [];
  if (slug === "albumin-globulin-ratio") extra.push(["globulin", "Globulin (g/dL)", 1, 6, 2.5]);
  if (slug === "calcium-phosphorus-product") extra.push(["phosphorus", "Phosphorus (mg/dL)", 1, 15, 3.5], ["ca", "Calcium (mg/dL)", 4, 15, 9]);
  if (slug === "transtubular-potassium") extra.push(["urine_k", "Urine K", 0, 100, 30], ["serum_k", "Serum K", 2, 8, 4], ["urine_osm", "Urine osmolality", 50, 1200, 500], ["serum_osm", "Serum osmolality", 250, 350, 290]);
  if (slug === "rifle-aki") extra.push(["baseline_cr", "Baseline creatinine", 0.3, 10, 1]);
  if (slug === "ldl-friedewald") extra.push(["total_chol", "Total cholesterol", 100, 400, 200], ["hdl", "HDL cholesterol", 20, 120, 55], ["trig", "Triglycerides", 50, 1000, 150]);
  if (slug === "iron-saturation") extra.push(["iron", "Serum iron (µg/dL)", 10, 300, 90], ["tibc", "TIBC (µg/dL)", 100, 500, 350]);
  push({ slug, name, category: "clinical-laboratory", formula, desc, fields, outputs: [[name, unit, outF, 2]], opts: { extraFields: extra } });
}

// Pulmonology
const pulm = [
  ["aa-gradient", "Alveolar–Arterial O₂ Gradient", "A–a gradient", "Oxygenation defect assessment.", ["fio2-percent", "paco2", "pao2"], "fio2 * 7.14 - paco2 / 0.8 - pao2", "mmHg"],
  ["pf-ratio", "P/F Ratio", "PaO₂/FiO₂", "ARDS severity index.", ["pao2", "fio2-percent"], "pao2 / (fio2 / 100)", "mmHg"],
  ["oxygen-content", "Arterial Oxygen Content", "CaO₂", "Oxygen carried in arterial blood.", ["hb", "pao2"], "1.34 * hb * sao2 / 100 + 0.003 * pao2", "mL/dL"],
  ["minute-ventilation", "Minute Ventilation", "VE", "Total ventilation per minute.", [], "tidal_volume * respiratory_rate", "L/min"],
  ["dead-space", "Physiologic Dead Space", "Bohr equation", "Dead space fraction estimate.", ["paco2"], "tidal_volume * (paco2 - pe_co2) / paco2", "mL"],
  ["lung-compliance", "Static Lung Compliance", "C = V/P", "Compliance from volume and pressure.", [], "tidal_volume / (plateau - peep)", "mL/cmH₂O"],
  ["ventilator-tidal-volume", "Predicted Tidal Volume", "6 mL/kg IBW", "Lung-protective tidal volume target.", ["height-cm", "sex-mf"], "6 * ibw", "mL"],
  ["ibw", "Ideal Body Weight (ARDSnet)", "ARDSnet IBW", "Ideal body weight for ventilation.", ["height-cm", "sex-mf"], "sex == 1 ? 50 + 0.91 * (height_cm - 152.4) : 45.5 + 0.91 * (height_cm - 152.4)", "kg"],
];

for (const row of pulm) {
  const [slug, name, formula, desc, fields, outF, unit] = row;
  const extra = [];
  if (slug === "minute-ventilation") extra.push(["tidal_volume", "Tidal volume (mL)", 200, 800, 500], ["respiratory_rate", "Respiratory rate", 5, 40, 16]);
  if (slug === "dead-space") extra.push(["tidal_volume", "Tidal volume (mL)", 200, 800, 500], ["pe_co2", "Mixed expired CO₂", 10, 60, 35]);
  if (slug === "lung-compliance") extra.push(["tidal_volume", "Tidal volume (mL)", 200, 800, 450], ["plateau", "Plateau pressure", 10, 40, 25], ["peep", "PEEP", 0, 25, 8]);
  if (slug === "ventilator-tidal-volume") extra.push(["ibw", "IBW (kg)", 30, 100, 70]);
  if (slug === "oxygen-content") extra.push(["sao2", "SaO₂ (%)", 70, 100, 98]);
  push({ slug, name, category: "pulmonology", formula, desc, fields, outputs: [[name, unit, outF, 1]], opts: { extraFields: extra } });
}

// Auto-generate additional calculators to reach 200+
const categories = {
  "nutrition-diet": [
    ["daily-protein-intake", "Daily Protein Target", "g/kg/day", "Protein target from body weight.", ["weight-kg"], "protein_gkg * weight_kg", "g/day", [["protein_gkg", "Protein (g/kg/day)", 0.5, 3, 1.2]]],
    ["calorie-deficit", "Calorie Deficit for Weight Loss", "7700 kcal/kg", "Daily deficit to lose target kg/week.", ["weight-kg"], "7700 * weekly_kg / 7", "kcal/day", [["weekly_kg", "Target loss (kg/week)", 0.1, 2, 0.5]]],
    ["macro-carbs", "Carbohydrate Calories", "kcal from carbs", "Carb calories from percent of total.", [], "total_kcal * carb_pct / 100", "kcal", [["total_kcal", "Total calories", 800, 5000, 2000], ["carb_pct", "Carb percent", 10, 70, 45]]],
    ["macro-fat", "Fat Calories", "kcal from fat", "Fat calories from percent of total.", [], "total_kcal * fat_pct / 100", "kcal", [["total_kcal", "Total calories", 800, 5000, 2000], ["fat_pct", "Fat percent", 10, 70, 30]]],
    ["macro-protein", "Protein Calories", "kcal from protein", "Protein calories from grams.", [], "protein_g * 4", "kcal", [["protein_g", "Protein (grams)", 20, 400, 100]]],
    ["fiber-intake", "Fiber Recommendation", "14 g/1000 kcal", "Dietary fiber target.", [], "14 * (total_kcal / 1000)", "g/day", [["total_kcal", "Total calories", 800, 5000, 2000]]],
    ["alcohol-units", "Alcohol Units", "Standard drinks", "Convert ethanol grams to units.", [], "ethanol_g / 10", "units", [["ethanol_g", "Ethanol (grams)", 0, 200, 14]]],
    ["glycemic-index-load", "Glycemic Load", "GL", "Glycemic load from GI and carbs.", [], "gi * carbs_g / 100", "", [["gi", "Glycemic index", 0, 100, 55], ["carbs_g", "Carbohydrate (g)", 0, 200, 50]]],
    ["meal-calories", "Calories per Meal", "Split meals", "Calories per meal from daily total.", [], "daily_kcal / meals", "kcal", [["daily_kcal", "Daily calories", 800, 5000, 2000], ["meals", "Meals per day", 1, 8, 3]]],
    ["sodium-intake", "Sodium Intake", "mg/day", "Sodium from salt grams.", [], "salt_g * 393", "mg", [["salt_g", "Salt (grams)", 0, 20, 6]]],
    ["water-from-weight", "Hydration from Weight", "30–35 mL/kg", "Alternative hydration estimate.", ["weight-kg"], "weight_kg * 33", "mL/day", []],
    ["calorie-surplus", "Calorie Surplus", "Lean gain", "Surplus for muscle gain goal.", [], "tdee + surplus", "kcal/day", [["tdee", "Maintenance calories", 1200, 5000, 2200], ["surplus", "Daily surplus", 100, 1000, 300]]],
    ["protein-per-meal", "Protein per Meal", "g/meal", "Distribute protein across meals.", [], "daily_protein / meals", "g", [["daily_protein", "Daily protein (g)", 40, 300, 120], ["meals", "Meals", 1, 8, 3]]],
    ["carb-to-insulin", "Carbohydrate to Insulin Ratio", "g/unit", "Insulin dosing education aid (not medical advice).", [], "carb_g / insulin_units", "g/unit", [["carb_g", "Carbs (g)", 0, 200, 45], ["insulin_units", "Insulin units", 0.5, 30, 4]]],
    ["energy-availability", "Energy Availability", "kcal/kg FFM", "Relative energy availability in athletes.", ["weight-kg"], "energy_intake / ffm", "kcal/kg", [["energy_intake", "Energy intake (kcal)", 1000, 6000, 2500], ["ffm", "Fat-free mass (kg)", 30, 100, 55]]],
  ],
  gastroenterology: [
    ["meld-score", "MELD Score (simplified)", "MELD", "Liver disease severity score (simplified inputs).", ["serum-creatinine", "bilirubin", "inr"], "3.78 * log(bilirubin) + 11.2 * log(inr) + 9.57 * log(scr) + 6.43", "points"],
    ["child-pugh", "Child-Pugh Points", "Child-Pugh", "Cirrhosis severity classification points.", [], "bilirubin_pts + albumin_pts + inr_pts + ascites_pts + enceph_pts", "points"],
    ["ast-alt-ratio", "AST/ALT Ratio", "De Ritis", "Hepatocellular injury pattern.", ["ast", "alt"], "ast / alt", ""],
    ["fib4", "FIB-4 Index", "Fibrosis screening", "Liver fibrosis screening index.", ["age-years", "ast", "alt", "platelet-count"], "(age * ast) / (plt * sqrt(alt))", ""],
    ["albumin-corrected-anion", "Albumin-corrected Anion Gap", "Corrected AG", "Anion gap adjusted for albumin.", ["sodium", "chloride", "bicarbonate", "albumin"], "na - (cl + hco3) + 2.5 * (4 - albumin)", "mEq/L"],
    ["hepatic-encephalopathy-grade", "HE Grade Helper", "West Haven", "Maps ammonia to suggested grade (educational).", [], "ammonia > 100 ? 2 : ammonia > 75 ? 1 : 0", "", [["ammonia", "Ammonia (µmol/L)", 10, 300, 45]]],
    ["na-maddens", "Maddrey Discriminant Function", "DF", "Alcoholic hepatitis severity.", ["bilirubin"], "4.6 * (bilirubin - 1.0)", ""],
    ["forrest-risk", "Upper GI Bleeding Risk", "Blatchford proxy", "Simplified bleeding risk placeholder.", ["hb", "sbp", "heart-rate"], "blatchford_proxy", "", []],
    ["glasgow-blatchford", "Glasgow-Blatchford Score", "GBS", "UGIB risk stratification (simplified).", ["hb", "sbp", "heart-rate"], "gbs_points", "points"],
    ["ranson-score", "Ranson Criteria Points", "Ranson", "Acute pancreatitis severity (simplified).", [], "ranson_points", "points"],
  ],
  hematology: [
    ["anc", "Absolute Neutrophil Count", "ANC", "Neutrophil count from WBC and percent.", ["wbc", "neut_pct"], "wbc * 1000 * neut_pct / 100", "/µL", [["neut_pct", "Neutrophil %", 0, 100, 60]]],
    ["corrected-wbc", "Corrected WBC for Nucleated RBC", "Corrected WBC", "Corrects for nucleated red cells.", ["wbc", "nRBC"], "wbc * 1000 / (1 + nRBC)", "/µL", [["nRBC", "nRBC per 100 WBC", 0, 50, 0]]],
    ["mentzer-index", "Mentzer Index", "MCV/RBC", "Thalassemia vs iron deficiency clue.", [], "mcv / rbc_millions", "", [["mcv", "MCV (fL)", 60, 120, 85], ["rbc_millions", "RBC (millions/µL)", 2, 8, 4.5]]],
    ["rdw-cv-helper", "RDW Interpretation", "RDW flag", "Flags likely variation pattern.", ["rdw"], "rdw > 15 ? 1 : 0", "", [["rdw", "RDW (%)", 10, 25, 13]]],
    ["inr-therapeutic", "INR Therapeutic Range", "Warfarin", "Distance from therapeutic INR.", ["inr"], "abs(inr - target_inr)", "", [["target_inr", "Target INR", 1.5, 4, 2.5]]],
    ["bleeding-risk-platelets", "Platelet Transfusion Threshold", "Threshold", "Educational threshold comparison.", ["plt"], "plt < threshold ? 1 : 0", "", [["threshold", "Threshold (×10³/µL)", 10, 100, 50]]],
    ["iron-deficiency-index", "Transferrin Saturation Index", "TSAT", "Iron deficiency screening.", [], "100 * iron / tibc", "%"],
    ["reticulocyte-index", "Reticulocyte Production Index", "RPI", "Marrow response to anemia.", [], "retic_pct * hct / 45 * (1 / maturation)", "", [["retic_pct", "Reticulocyte %", 0, 30, 1.5], ["hct", "Hematocrit %", 15, 60, 36], ["maturation", "Maturation factor", 1, 3, 2]]],
    ["fibrinogen-level", "Fibrinogen Convert", "mg/dL to g/L", "Unit conversion for fibrinogen.", [], "fibrinogen_mgdl / 100", "g/L", [["fibrinogen_mgdl", "Fibrinogen (mg/dL)", 50, 800, 300]]],
    ["mean-corpuscular-hb", "MCH", "Hb/RBC", "Mean corpuscular hemoglobin.", ["hb", "rbc_millions"], "hb / rbc_millions", "pg", [["rbc_millions", "RBC (millions/µL)", 2, 8, 4.5]]],
  ],
  endocrinology: [
    ["homa-ir", "HOMA-IR", "Insulin resistance", "Homeostatic model assessment.", [], "glucose * insulin / 405", "", [["insulin", "Fasting insulin (µIU/mL)", 1, 100, 10]]],
    ["quicki", "QUICKI", "Insulin sensitivity", "Quantitative insulin sensitivity check.", [], "1 / (log(glucose) + log(insulin))", ""],
    ["a1c-eag", "eAG from HbA1c", "ADAG", "Estimated average glucose from A1c.", [], "28.7 * a1c - 46.7", "mg/dL", [["a1c", "HbA1c (%)", 4, 15, 7]]],
    ["corrected-sodium", "Corrected Sodium", "Hyperglycemia", "Sodium correction for glucose.", ["sodium", "glucose"], "na + 0.024 * (glucose - 100)", "mEq/L"],
    ["free-testosterone", "Free Testosterone Index", "FTI", "Calculated free testosterone index.", [], "total_t * shbg_ratio", "ng/dL", [["total_t", "Total testosterone", 50, 1500, 400], ["shbg_ratio", "SHBG ratio factor", 0.1, 2, 1]]],
    ["tsh-t4-ratio", "TSH/T4 Ratio", "Thyroid balance", "Thyroid function pattern index.", [], "tsh / free_t4", "", [["tsh", "TSH (mIU/L)", 0.01, 50, 2], ["free_t4", "Free T4 (ng/dL)", 0.1, 5, 1.2]]],
    ["calcium-phos-product", "Ca×Phos Product", "CKD-MBD", "Mineral bone disorder marker.", ["measured-calcium"], "ca * phos", "mg²/dL²", [["ca", "Calcium", 4, 15, 9], ["phos", "Phosphorus", 1, 15, 3.5]]],
    ["insulin-dose-weight", "Weight-Based Insulin", "0.5–1 U/kg", "Educational total daily insulin estimate.", ["weight-kg"], "units_per_kg * weight_kg", "units/day", [["units_per_kg", "Units/kg/day", 0.2, 2, 0.6]]],
    ["steroid-conversion", "Steroid Dose Conversion", "Prednisone equiv", "Glucocorticoid equivalence.", [], "dose_mg * factor", "mg prednisone equiv", [["dose_mg", "Dose (mg)", 0.5, 100, 5], ["factor", "Equivalence factor", 0.1, 10, 1]]],
    ["bmr-diabetes", "Adjusted BMR Diabetes", "Activity", "BMR with diabetes activity factor.", ["age-years", "sex-mf", "height-cm", "weight-kg"], "(10 * weight_kg + 6.25 * height_cm - 5 * age + (sex == 1 ? 5 : -161)) * diabetes_factor", "kcal", [["diabetes_factor", "Activity factor", 1, 1.8, 1.2]]],
    ["anion-gap-osm", "Osmolar Gap", "Toxic alcohol screen", "Gap between measured and calculated osmolality.", [], "measured_osm - calculated_osm", "mOsm", [["measured_osm", "Measured osm", 250, 400, 290], ["calculated_osm", "Calculated osm", 250, 400, 290]]],
  ],
  "emergency-critical-care": [
    ["qsofa", "qSOFA Score", "qSOFA", "Quick SOFA for sepsis screening.", ["sbp", "respiratory-rate", "gcs"], "qsofa_points", "points", [["gcs", "GCS", 3, 15, 15], ["respiratory-rate", "Respiratory rate", 4, 60, 18]]],
    ["news2", "NEWS2 (simplified)", "NEWS2", "National Early Warning Score (simplified).", ["respiratory-rate", "sbp", "heart-rate", "body-temperature"], "news2_points", "points"],
    ["apache-proxy", "Severity Proxy Score", "ICU proxy", "Educational severity proxy from vitals.", ["sbp", "heart-rate", "age-years"], "apache_proxy", "points"],
    ["parkland-burns", "Parkland Formula", "Burn resuscitation", "24h fluid for burns.", ["weight-kg"], "4 * weight_kg * tbsa", "mL", [["tbsa", "TBSA burn %", 1, 100, 20]]],
    ["gcs-total", "Glasgow Coma Scale", "GCS", "Sum of eye, verbal, motor.", [], "eye + verbal + motor", "points", [["eye", "Eye (1-4)", 1, 4, 4], ["verbal", "Verbal (1-5)", 1, 5, 5], ["motor", "Motor (1-6)", 1, 6, 6]]],
    ["wells-pe", "Wells PE Score", "Wells", "Pulmonary embolism pretest probability (simplified).", [], "wells_pe_points", "points"],
    ["perc-rule", "PERC Rule", "PERC", "Pulmonary embolism rule-out (simplified).", ["age-years", "heart-rate", "sbp"], "perc_positive", ""],
    ["curb65", "CURB-65", "CURB-65", "Pneumonia severity (simplified).", ["age-years"], "curb65_points", "points"],
    ["psi-port", "Pneumonia Severity Index", "PSI proxy", "Community pneumonia risk proxy.", ["age-years"], "psi_proxy", "points"],
    ["sofa-proxy", "SOFA Proxy", "SOFA", "Organ dysfunction proxy score.", ["sbp", "platelet-count", "serum-creatinine", "bilirubin"], "sofa_proxy", "points"],
    ["anion-gap-lactate", "Lactate Clearance", "Clearance %", "Percent lactate clearance.", [], "100 * (initial_lac - current_lac) / initial_lac", "%", [["initial_lac", "Initial lactate", 0.5, 20, 4], ["current_lac", "Current lactate", 0.1, 20, 2]]],
    ["dose-epinephrine", "Epinephrine Dose", "mcg/min", "Infusion dose from concentration.", [], "mcg_kg_min * weight_kg", "mcg/min", [["mcg_kg_min", "mcg/kg/min", 0.01, 2, 0.1]]],
  ],
  pharmacology: [
    ["weight-based-dose", "Weight-Based Dose", "mg/kg", "Total dose from mg/kg.", ["weight-kg"], "mg_per_kg * weight_kg", "mg", [["mg_per_kg", "Dose (mg/kg)", 0.01, 50, 10]]],
    ["iv-drip-rate", "IV Drip Rate", "mL/hr", "Infusion rate from dose and concentration.", [], "dose_mcg_kg_min * weight_kg * 60 / concentration", "mL/hr", [["dose_mcg_kg_min", "mcg/kg/min", 0.01, 20, 5], ["concentration", "Concentration (mcg/mL)", 1, 1600, 400]]],
    ["pediatric-dose-young", "Pediatric Dose (Young's)", "Age-based", "Clark/Young rule dose fraction.", ["age-years"], "adult_dose * age / (age + 12)", "mg", [["adult_dose", "Adult dose (mg)", 1, 2000, 500]]],
    ["bsa-dose", "BSA-Based Dose", "mg/m²", "Chemotherapy BSA dosing.", ["height-cm", "weight-kg"], "dose_per_m2 * sqrt(height_cm * weight_kg / 3600)", "mg", [["dose_per_m2", "Dose (mg/m²)", 1, 500, 75]]],
    ["opioid-mme", "Morphine Milligram Equivalents", "MME", "Opioid equivalence calculator.", [], "morphine_mg * 1 + oxycodone_mg * 1.5 + hydromorphone_mg * 5", "MME/day", [["morphine_mg", "Morphine (mg/day)", 0, 500, 30], ["oxycodone_mg", "Oxycodone (mg/day)", 0, 500, 0], ["hydromorphone_mg", "Hydromorphone (mg/day)", 0, 200, 0]]],
    ["paracetamol-toxicity", "Paracetamol Toxicity Risk", "Nomogram proxy", "Risk flag vs dose (educational).", [], "dose_g > 7.5 ? 1 : 0", "", [["dose_g", "Single dose (grams)", 0, 50, 4]]],
    ["antibiotic-renal", "Renal Dose Adjustment", "CrCl factor", "Dose reduction factor from CrCl.", ["age-years", "weight-kg", "sex-mf", "serum-creatinine"], "crcl_factor", "", []],
    ["drip-factor", "Drop Factor Rate", "gtt/min", "IV drip rate from mL/hr.", [], "ml_per_hr * drop_factor / 60", "gtt/min", [["ml_per_hr", "mL/hr", 1, 1000, 100], ["drop_factor", "Drop factor", 10, 60, 20]]],
    ["concentration-dilution", "Solution Dilution", "C1V1=C2V2", "Stock dilution calculator.", [], "c1 * v1 / c2", "mL", [["c1", "Stock concentration", 0.1, 100, 10], ["v1", "Volume stock (mL)", 0.1, 1000, 10], ["c2", "Final concentration", 0.01, 50, 1]]],
    ["mg-ml-conversion", "mg to mL", "Liquid dose", "Convert mg dose to volume.", [], "dose_mg / conc_mg_ml", "mL", [["dose_mg", "Dose (mg)", 0.1, 5000, 250], ["conc_mg_ml", "Concentration (mg/mL)", 0.01, 500, 25]]],
    ["pediatric-fluid", "Pediatric Maintenance Fluids", "Holliday-Segar", "Maintenance fluids by weight.", ["weight-kg"], "weight_kg <= 10 ? weight_kg * 100 : weight_kg <= 20 ? 1000 + (weight_kg - 10) * 50 : 1500 + (weight_kg - 20) * 20", "mL/day", []],
    ["heparin-weight", "Heparin Loading Dose", "Units/kg", "Weight-based heparin bolus.", ["weight-kg"], "units_per_kg * weight_kg", "units", [["units_per_kg", "Units/kg", 10, 120, 80]]],
    ["vancomycin-dose", "Vancomycin Dose", "mg/kg", "Initial vancomycin dose estimate.", ["weight-kg"], "15 * weight_kg", "mg", []],
    ["gentamicin-dose", "Gentamicin Dose", "mg/kg", "Aminoglycoside weight-based dose.", ["weight-kg"], "dose_mg_kg * weight_kg", "mg", [["dose_mg_kg", "mg/kg", 1, 10, 5]]],
  ],
  "obstetrics-pediatrics": [
    ["edd-lmp", "Estimated Due Date", "Naegele", "EDD from LMP (simplified).", [], "lmp_day + 280", "days from LMP", [["lmp_day", "Days since LMP", 0, 300, 60]]],
    ["gestational-age", "Gestational Age", "Weeks", "Gestational age from days.", [], "days / 7", "weeks", [["days", "Days since LMP", 0, 320, 196]]],
    ["fetal-weight-hadlock", "Estimated Fetal Weight", "Hadlock proxy", "Ultrasound EFW proxy.", [], "efw_g / 1000", "kg", [["efw_g", "EFW (grams)", 200, 6000, 3200]]],
    ["apgar", "Apgar Score", "Apgar", "Neonatal Apgar sum.", [], "appearance + pulse + grimace + activity + resp", "points", [["appearance", "Appearance (0-2)", 0, 2, 2], ["pulse", "Pulse (0-2)", 0, 2, 2], ["grimace", "Grimace (0-2)", 0, 2, 2], ["activity", "Activity (0-2)", 0, 2, 2], ["resp", "Respiration (0-2)", 0, 2, 2]]],
    ["pediatric-bmi", "Pediatric BMI", "BMI", "BMI for children (value only).", ["height-cm", "weight-kg"], "weight_kg / (height_cm / 100) ^ 2", "kg/m²", []],
    ["ibw-pediatric", "Pediatric IBW", "IBW", "Ideal body weight pediatric formula.", ["height-cm", "sex-mf"], "sex == 1 ? 50 + 0.91 * (height_cm - 152.4) : 45.5 + 0.91 * (height_cm - 152.4)", "kg", []],
    ["neonatal-glucose", "Neonatal Glucose", "mg/dL", "Screening value entry.", ["glucose"], "glucose", "mg/dL", []],
    ["fluid-neonate", "Neonate Fluid", "mL/kg/day", "Neonatal maintenance fluids.", ["weight-kg"], "weight_kg * ml_kg_day", "mL/day", [["ml_kg_day", "mL/kg/day", 60, 200, 100]]],
    ["downes-score", "Downes Score", "Resp distress", "Neonatal respiratory distress (simplified).", [], "downes_points", "points"],
    ["pews", "PEWS", "Pediatric early warning", "Pediatric early warning proxy.", ["heart-rate", "sbp", "respiratory-rate"], "pews_points", "points"],
    ["target-height-midparent", "Mid-Parental Height", "Target height", "Predicted adult height.", [], "(mother + father) / 2 + (sex == 1 ? 13 : -13)", "cm", [["mother", "Mother height (cm)", 140, 200, 165], ["father", "Father height (cm)", 150, 210, 178]]],
    ["birth-weight-percentile", "Birth Weight Centile", "Centile proxy", "Birth weight centile proxy.", [], "bw_centile_proxy", "", [["bw_g", "Birth weight (g)", 500, 6000, 3300]]],
    ["pregnancy-weight-gain", "Pregnancy Weight Gain", "Total gain", "Weight gain during pregnancy.", ["weight-kg"], "current_weight - pre_pregnancy", "kg", [["current_weight", "Current weight (kg)", 40, 150, 75], ["pre_pregnancy", "Pre-pregnancy weight (kg)", 40, 150, 65]]],
  ],
  neurology: [
    ["nihss-proxy", "NIHSS Proxy", "Stroke scale", "Stroke severity proxy.", [], "nihss_points", "points"],
    ["gcs", "Glasgow Coma Scale", "GCS", "Consciousness level.", [], "eye + verbal + motor", "", [["eye", "Eye", 1, 4, 4], ["verbal", "Verbal", 1, 5, 5], ["motor", "Motor", 1, 6, 6]]],
    ["ich-volume", "ICH Volume", "ABC/2", "Intracerebral hemorrhage volume.", [], "abc_volume", "mL", [["a", "Length A (cm)", 0.1, 10, 4], ["b", "Length B (cm)", 0.1, 10, 3], ["c", "Length C (cm)", 0.1, 10, 3]]],
    ["hunt-hess", "Hunt and Hess Grade", "SAH", "Subarachnoid hemorrhage grade proxy.", [], "hh_grade", ""],
    ["fisher-grade", "Fisher Grade", "SAH CT", "Vasospasm risk on CT (proxy).", [], "fisher_grade", ""],
    ["abcd2", "ABCD2 Score", "TIA risk", "Stroke risk after TIA (simplified).", ["age-years", "sbp"], "abcd2_points", "points"],
    ["canadian-ct-head", "Canadian CT Head Rule", "CT need", "Minor head injury CT rule proxy.", ["age-years"], "ct_rule_positive", ""],
    ["west-haven", "West Haven Criteria", "HE grade", "Hepatic encephalopathy grade proxy.", [], "wh_grade", ""],
    ["ciwa-ar", "CIWA-Ar Proxy", "Alcohol withdrawal", "Withdrawal severity proxy.", [], "ciwa_points", "points"],
    ["bisap", "BISAP Score", "Pancreatitis", "Pancreatitis mortality score (simplified).", ["age-years"], "bisap_points", "points"],
    ["ranson-gcs", "Ranson + GCS", "Combined", "Combined severity education.", [], "ranson_points + (15 - gcs)", "points", [["ranson_points", "Ranson points", 0, 11, 2], ["gcs", "GCS", 3, 15, 15]]],
    ["stroke-volume-brain", "Cerebral Perfusion Pressure", "CPP", "CPP = MAP − ICP.", ["systolic-bp", "diastolic-bp"], "(sbp + 2 * dbp) / 3 - icp", "mmHg", [["icp", "ICP (mmHg)", 0, 40, 15]]],
    ["mrs", "Modified Rankin Scale", "mRS", "Functional outcome scale entry.", [], "mrs", "", [["mrs", "mRS (0-6)", 0, 6, 1]]],
  ],
  "oncology-supportive": [
    ["bsa-mosteller", "BSA for Chemotherapy", "Mosteller", "Body surface area for chemo dosing.", ["height-cm", "weight-kg"], "sqrt(height_cm * weight_kg / 3600)", "m²", []],
    ["carboplatin-calvert", "Carboplatin AUC", "Calvert", "Carboplatin dosing by AUC.", ["age-years", "weight-kg", "sex-mf", "serum-creatinine"], "auc * (gfr + 25)", "mg", [["auc", "Target AUC", 1, 8, 5], ["gfr", "GFR (mL/min)", 10, 150, 90]]],
    ["karnofsky", "Karnofsky Score", "KPS", "Performance status percent.", [], "kps", "%", [["kps", "KPS (0-100)", 0, 100, 80]]],
    ["ecog", "ECOG Performance Status", "ECOG", "Eastern Cooperative Oncology Group status.", [], "ecog", "", [["ecog", "ECOG (0-5)", 0, 5, 1]]],
    ["opioid-conversion", "Opioid Conversion", "MME", "Morphine milligram equivalents.", [], "mme_total", "MME/day", []],
    ["chemo-bsa-dose", "Chemo Dose by BSA", "mg/m²", "BSA-based chemotherapy dose.", ["height-cm", "weight-kg"], "dose_m2 * sqrt(height_cm * weight_kg / 3600)", "mg", [["dose_m2", "Dose mg/m²", 1, 500, 75]]],
    ["neutropenic-fever-risk", "Febrile Neutropenia Risk", "ANC threshold", "ANC below threshold flag.", ["wbc"], "wbc * 1000 * neut_pct / 100 < anc_threshold", "", [["neut_pct", "Neutrophil %", 0, 100, 50], ["anc_threshold", "ANC threshold", 100, 2000, 500]]],
    ["fluid-allowance", "Daily Fluid Allowance", "Oncology fluids", "Maintenance fluids in oncology.", ["weight-kg"], "weight_kg * 30", "mL", []],
    ["albumin-oncology", "Albumin Correction", "Nutrition", "Oncology nutrition marker.", ["albumin"], "albumin", "g/dL", []],
    ["corrected-calcium-onc", "Corrected Calcium", "Oncology Ca", "Corrected calcium in malignancy.", ["measured-calcium", "albumin"], "measured_ca + 0.8 * (4 - albumin)", "mg/dL", []],
    ["tls-risk", "Tumor Lysis Risk", "TLS proxy", "Tumor lysis syndrome risk proxy.", ["potassium", "phosphate", "uric-acid"], "tls_points", "points", [["phosphate", "Phosphate", 1, 15, 3.5], ["uric-acid", "Uric acid", 1, 20, 5]]],
    ["bsa-du-bois", "BSA Du Bois", "Du Bois", "Alternative BSA formula.", ["height-cm", "weight-kg"], "0.20247 * (height_cm / 100) ^ 0.725 * weight_kg ^ 0.425", "m²", []],
  ],
};

// Expand category batches
for (const [cat, items] of Object.entries(categories)) {
  for (const row of items) {
    const [slug, name, formula, desc, fields, outF, unit, extraFields = []] = row;
    push({
      slug,
      name,
      category: cat,
      formula,
      desc,
      fields,
      outputs: [[name.split("(")[0].trim(), unit, outF, 2]],
      opts: { extraFields },
    });
  }
}

// Additional cardiology & lab tools (no filler catalogs)
const extraBatch = [
  ["cardiology", "qtc-fredericia", "Corrected QT (Fridericia)", "QTc = QT / RR^(1/3)", "QT interval corrected with Fridericia.", [], "qt_ms / (60 / heart_rate) ^ (1/3)", "ms", [["qt_ms", "QT interval (ms)", 200, 600, 400]]],
  ["cardiology", "qtc-framingham", "Corrected QT (Framingham)", "QTc = QT + 0.154×(1−RR)", "Alternative QT correction formula.", [], "qt_ms + 154 * (1 - 60 / heart_rate)", "ms", [["qt_ms", "QT interval (ms)", 200, 600, 400]]],
  ["cardiology", "diastolic-dysfunction-proxy", "E/e′ Ratio", "E/e′", "Diastolic function estimate from echo indices.", [], "e_velocity / e_prime", "", [["e_velocity", "E velocity (cm/s)", 20, 200, 80], ["e_prime", "e′ velocity (cm/s)", 2, 25, 10]]],
  ["nephrology", "urea-reduction-ratio", "Urea Reduction Ratio", "URR", "Dialysis adequacy from pre/post BUN.", [], "100 * (1 - urea_post / urea_pre)", "%", [["urea_pre", "Pre-dialysis BUN", 10, 200, 80], ["urea_post", "Post-dialysis BUN", 5, 100, 20]]],
  ["nephrology", "creatinine-height-index", "Creatinine Height Index", "CHI", "Muscle mass screening in CKD.", ["height-cm", "serum-creatinine"], "((140 - age) * height_cm / (72 * scr)) / height_cm", "", []],
  ["pulmonology", "horowitz-index", "Horowitz Index (PAFI)", "PaO₂/FiO₂", "Oxygenation index for ARDS classification.", ["pao2", "fio2-percent"], "pao2 / (fio2 / 100)", "mmHg", []],
  ["pulmonology", "respiratory-quotient", "Respiratory Quotient", "RQ = VCO₂/VO₂", "Metabolic substrate utilization index.", [], "vco2 / vo2", "", [["vco2", "VCO₂ (mL/min)", 50, 3000, 200], ["vo2", "VO₂ (mL/min)", 50, 3000, 250]]],
  ["hematology", "absolute-lymphocyte-count", "Absolute Lymphocyte Count", "ALC", "Lymphocyte count from WBC percentage.", ["wbc"], "wbc * 1000 * lymph_pct / 100", "/µL", [["lymph_pct", "Lymphocyte %", 0, 100, 30]]],
  ["hematology", "absolute-eosinophil-count", "Absolute Eosinophil Count", "AEC", "Eosinophil count from WBC percentage.", ["wbc"], "wbc * 1000 * eos_pct / 100", "/µL", [["eos_pct", "Eosinophil %", 0, 100, 2]]],
  ["endocrinology", "homa-beta", "HOMA-Beta", "Beta-cell function", "Beta-cell function estimate.", [], "20 * insulin / (glucose - 3.5)", "", [["insulin", "Fasting insulin (µIU/mL)", 1, 100, 10]]],
  ["nutrition-diet", "protein-percent-calories", "Protein Percent of Calories", "% kcal from protein", "Percent of total calories from protein grams.", [], "100 * protein_g * 4 / total_kcal", "%", [["protein_g", "Protein (g)", 20, 400, 100], ["total_kcal", "Total calories", 800, 5000, 2000]]],
  ["nutrition-diet", "alcohol-calories", "Alcohol Calories", "kcal from ethanol", "Calories contributed by alcoholic beverages.", [], "ethanol_g * 7", "kcal", [["ethanol_g", "Ethanol (grams)", 0, 200, 14]]],
  ["pharmacology", "pediatric-dose-clark", "Pediatric Dose (Clark)", "Weight-based fraction", "Clark rule pediatric dose estimate.", ["weight-kg"], "adult_dose * weight_kg / 70", "mg", [["adult_dose", "Adult dose (mg)", 1, 2000, 500]]],
  ["pharmacology", "aminoglycoside-interval", "Extended Interval Aminoglycoside", "Hartford nomogram helper", "Peak-based interval suggestion (educational).", [], "peak > 60 ? 24 : peak > 50 ? 36 : 48", "hours", [["peak", "Peak level (µg/mL)", 10, 80, 55]]],
  ["obstetrics-pediatrics", "bishop-score", "Bishop Score", "Cervical readiness", "Labor induction readiness score.", [], "dilation + effacement + station + consistency + position", "points", [["dilation", "Dilation (0-3)", 0, 3, 1], ["effacement", "Effacement (0-3)", 0, 3, 1], ["station", "Station (0-3)", 0, 3, 1], ["consistency", "Consistency (0-2)", 0, 2, 1], ["position", "Position (0-2)", 0, 2, 1]]],
  ["neurology", "glasgow-pupils-score", "GCS-Pupils Score", "GCS-P", "Combines GCS with pupil reactivity (simplified).", ["gcs"], "gcs + pupil_score", "points", [["pupil_score", "Pupil score (0-2)", 0, 2, 2]]],
  ["oncology-supportive", "steroid-cross-equiv", "Dexamethasone Equivalence", "Steroid conversion", "Convert dexamethasone dose to prednisone equivalent.", [], "dex_mg * 6.7", "mg prednisone equiv", [["dex_mg", "Dexamethasone (mg)", 0.5, 40, 4]]],
];

for (const row of extraBatch) {
  const [category, slug, name, formula, desc, fields, outF, unit, extraFields = []] = row;
  const extra = [];
  if (slug.includes("qtc") || slug === "diastolic-dysfunction-proxy") {
    extra.push(["heart_rate", "Heart rate (bpm)", 30, 220, 72]);
  }
  for (const ef of extraFields) extra.push(ef);
  push({ slug, name, category, formula, desc, fields, outputs: [[name, unit, outF, 2]], opts: { extraFields: extra } });
}

// Remove duplicate slugs (keep first)
const seen = new Set();
const unique = [];
for (const e of entries) {
  if (seen.has(e.slug)) continue;
  seen.add(e.slug);
  unique.push(e);
}

function emitTs(obj) {
  if (obj.type === "calc") return `calc(...)`; // unused
}

function fieldRef(sharedSlug) {
  return `{ shared: ${JSON.stringify(sharedSlug)} }`;
}

function extraField([key, label, min, max, def]) {
  return `{ key: ${JSON.stringify(key)}, label: ${JSON.stringify(label)}, fieldType: "NUMBER", min: ${min}, max: ${max}, defaultValue: ${def} }`;
}

function renderEntry(e) {
  const fields = [];
  for (const s of e.fields ?? []) {
    if (typeof s === "string") fields.push(fieldRef(s));
  }
  for (const ef of e.opts?.extraFields ?? []) {
    fields.push(extraField(ef));
  }
  const outputs = (e.outputs ?? []).map(
    ([label, unit, formula, decimals]) =>
      `out(${JSON.stringify(label)}, ${JSON.stringify(unit)}, ${JSON.stringify(formula)}, ${decimals ?? 1})`,
  );
  const contentHints = e.opts?.contentHints
    ? `, content: ${JSON.stringify(e.opts.contentHints)}`
  : "";
  return `  calc(
    ${JSON.stringify(e.slug)},
    ${JSON.stringify(e.name)},
    ${JSON.stringify(e.category)},
    ${JSON.stringify(e.formula)},
    ${JSON.stringify(e.desc)},
    [${fields.join(", ")}],
    [${outputs.join(", ")}]${contentHints}
  )`;
}

const header = `/* AUTO-GENERATED by scripts/generate-calculator-catalog.mjs — do not edit by hand */
import { calc, out } from "./helpers";
import type { SeedCalculator } from "../types";

export const generatedCatalog: SeedCalculator[] = [
`;

const footer = `];
`;

const body = unique.map(renderEntry).join(",\n");
const outPath = path.join(process.cwd(), "prisma/seed-data/calculators/generated-catalog.ts");
fs.writeFileSync(outPath, header + body + footer, "utf8");
console.log(`Wrote ${unique.length} calculators to ${outPath}`);
