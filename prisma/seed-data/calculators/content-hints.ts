import type { SeedCalculator, SeedContentHints } from "../types";

const hintsBySlug: Record<string, SeedContentHints> = {
  bmi: {
    overview:
      "Body mass index (BMI) is a widely used screening measure that relates body weight to height. It helps categorize underweight, healthy weight, overweight, and obesity for adults in population health and clinic settings.",
    interpretation:
      "For adults, BMI below 18.5 may suggest underweight; 18.5–24.9 is often considered a healthy range; 25–29.9 indicates overweight; 30 and above indicates obesity. BMI does not distinguish muscle from fat and may misclassify athletes, older adults, and some ethnic groups—use it alongside waist measures and clinical context.",
    clinicalNotes:
      "In pregnancy, pediatrics, and certain chronic diseases, prefer specialty growth charts or alternative indices rather than adult BMI categories alone.",
    faq: [
      {
        q: "Is BMI accurate for everyone?",
        a: "No. It is a population screening tool. Muscular builds, edema, and age-related body composition changes can shift interpretation.",
      },
      {
        q: "Should I use BMI alone to diagnose obesity?",
        a: "Clinical diagnosis considers exam findings, metabolic risk, waist circumference, and comorbidities—not BMI by itself.",
      },
    ],
  },
  bmr: {
    overview:
      "Basal metabolic rate (BMR) estimates the calories your body would burn at complete rest over 24 hours. The Mifflin–St Jeor equation is commonly used in nutrition counseling because it performs well across diverse adult populations.",
    interpretation:
      "Typical adult BMR often falls between roughly 1,200 and 2,000 kcal/day depending on size, age, and sex. Values far outside expected ranges usually reflect data entry errors or atypical physiology.",
  },
  tdee: {
    overview:
      "Total daily energy expenditure (TDEE) builds on BMR by multiplying for physical activity. Dietitians use TDEE to set weight maintenance, loss, or gain targets when paired with dietary assessment.",
    interpretation:
      "Multiply BMR by an activity factor that honestly reflects lifestyle. Sedentary office work differs from manual labor or daily training. Revisit the factor when weight trends plateau unexpectedly.",
  },
  "creatinine-clearance": {
    overview:
      "Creatinine clearance estimated by Cockcroft–Gault approximates kidney filtration using age, sex, weight, and serum creatinine. Clinicians historically used it for drug dosing, though institutional protocols increasingly specify CKD-EPI or measured GFR.",
    interpretation:
      "Higher values generally indicate better filtration. Very low clearance suggests dose adjustment for renally cleared medications and evaluation for chronic kidney disease when persistent.",
    limitations:
      "Unreliable in extremes of muscle mass, amputations, acute kidney injury, and unstable creatinine. Do not use as the sole criterion for dialysis initiation.",
  },
  "egfr-ckd-epi": {
    overview:
      "The CKD-EPI equation estimates glomerular filtration rate (eGFR) from creatinine, age, and sex. It is widely reported on laboratory panels and stages chronic kidney disease.",
    interpretation:
      "eGFR ≥90 with kidney damage markers may still indicate CKD. Values 60–89 suggest mild reduction; 30–59 moderate; 15–29 severe; below 15 indicates kidney failure range—always interpret with urine albumin, trends, and symptoms.",
  },
  map: {
    overview:
      "Mean arterial pressure (MAP) approximates average arterial pressure during the cardiac cycle. It is used in perfusion targets during shock resuscitation and ICU care.",
    interpretation:
      "Adults often target MAP ≥65 mmHg in septic shock, though goals vary by comorbidity, chronic hypertension, and end-organ perfusion markers. Pair MAP with urine output, lactate, and mental status.",
  },
  qsofa: {
    overview:
      "The quick SOFA (qSOFA) score screens for sepsis outside the ICU using blood pressure, respiratory rate, and mental status. A score of 2 or more prompts further evaluation and monitoring.",
    interpretation:
      "Each criterion contributes one point: systolic BP ≤100 mmHg, respiratory rate ≥22/min, or altered mentation (GCS <15). qSOFA is a screening aid—not a substitute for cultures, lactate, fluids, and source control.",
  },
  curb65: {
    overview:
      "CURB-65 stratifies adults with community-acquired pneumonia to guide disposition. Five binary criteria capture confusion, urea, respiratory rate, blood pressure, and age.",
    interpretation:
      "Scores 0–1 often support outpatient care; 2 suggests hospital admission; 3–5 indicate severe illness and higher mortality risk. Always integrate oxygenation, comorbidities, and social support.",
  },
  "wells-pe": {
    overview:
      "The Wells score estimates pretest probability of pulmonary embolism before imaging. It combines clinical signs, risk factors, and whether an alternative diagnosis is likely.",
    interpretation:
      "Low scores favor ruling out PE when paired with negative D-dimer in appropriate populations. Moderate and high scores warrant imaging such as CT pulmonary angiography per local pathways.",
  },
  "glasgow-blatchford": {
    overview:
      "The Glasgow–Blatchford score (GBS) risk-stratifies upper gastrointestinal bleeding. It identifies patients who may be managed without admission when scores are very low.",
    interpretation:
      "A score of 0–1 in validated settings may support outpatient management in selected patients. Higher scores correlate with transfusion need and intervention—coordinate with gastroenterology early.",
  },
  "child-pugh": {
    overview:
      "The Child–Pugh score classifies cirrhosis severity using bilirubin, albumin, INR, ascites, and encephalopathy. It informs prognosis and transplant referral discussions.",
    interpretation:
      "Class A (5–6 points) generally has better prognosis than Class B (7–9) or Class C (10–15). Use alongside MELD-Na and clinical course for transplant listing.",
  },
  "cha2ds2-vasc": {
    overview:
      "CHA₂DS₂-VASc estimates annual stroke risk in non-valvular atrial fibrillation to guide anticoagulation discussions. Each comorbidity adds weighted points.",
    interpretation:
      "Scores ≥2 in men or ≥3 in women historically favor anticoagulation unless bleeding risk outweighs benefit. Shared decision-making with HAS-BLED and patient preferences is essential.",
  },
  "has-bled": {
    overview:
      "HAS-BLED highlights modifiable bleeding risk factors in patients considered for anticoagulation. It does not contraindicate anticoagulation but prompts risk mitigation.",
    interpretation:
      "Scores ≥3 indicate high bleeding risk—address hypertension, labile INR, medications, and alcohol; monitor closely rather than automatically withholding therapy.",
  },
  "heart-score": {
    overview:
      "The HEART score stratifies chest pain patients in the emergency department for major adverse cardiac events within six weeks.",
    interpretation:
      "Scores 0–3 support early discharge pathways in validated settings; 4–6 warrant observation; 7–10 indicate high risk and aggressive evaluation. Always follow institutional chest pain protocols.",
  },
};

const categoryDefaults: Record<string, SeedContentHints> = {
  anthropometry: {
    clinicalNotes:
      "Anthropometric indices support screening and counseling. They should be interpreted with diet history, activity, medications, and culturally appropriate goals.",
  },
  "nutrition-diet": {
    clinicalNotes:
      "Nutrition calculators provide planning estimates. Individual needs vary with pregnancy, sport, renal disease, and diabetes—personalize with a registered dietitian when possible.",
  },
  "fitness-hydration": {
    clinicalNotes:
      "Hydration and training targets adjust for climate, sweat rate, fever, and kidney disease. Increase fluids cautiously when heart failure or hyponatremia risk exists.",
  },
  cardiology: {
    clinicalNotes:
      "Cardiovascular calculations support assessment but never replace ECG, imaging, troponin trends, or emergent reperfusion pathways when STEMI is suspected.",
  },
  nephrology: {
    clinicalNotes:
      "Renal estimates fluctuate with hydration, muscle mass, and acute illness. Trend values over time and correlate with urine studies and blood pressure control.",
  },
  pharmacology: {
    limitations:
      "Dosing tools are educational. Always verify concentrations, infusion pumps, pediatric weight, and institutional protocols before administering medications.",
  },
  "emergency-critical-care": {
    clinicalNotes:
      "Severity scores guide triage and monitoring frequency. They do not replace clinician judgment, serial exams, or escalation when the patient appears unwell despite a low score.",
  },
};

export function applyContentHints(calculators: SeedCalculator[]): SeedCalculator[] {
  return calculators.map((c) => {
    const specific = hintsBySlug[c.slug];
    const category = categoryDefaults[c.category];
    if (!specific && !category) return c;
    return {
      ...c,
      content: {
        ...category,
        ...specific,
        faq: specific?.faq ?? category?.faq,
        howToUse: specific?.howToUse ?? category?.howToUse,
      },
    };
  });
}
