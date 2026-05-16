import { buildContentHtmlFromBlocks, type ContentBlock } from "@/lib/calculator-content-blocks";
import type { SeedCalculator, SeedContentHints } from "@/prisma/seed-data/types";

function defaultHowToUse(name: string): string[] {
  return [
    `Open the ${name} and enter your values using the units shown beside each field.`,
    "Review that inputs are within the typical physiological range before you calculate.",
    "Read the result together with the interpretation notes below and your local clinical context.",
  ];
}

function defaultLimitations(): string {
  return "This tool supports education and clinical triage only. It does not replace professional medical advice, diagnosis, or treatment. Reference ranges vary by laboratory, age, pregnancy status, and comorbidity. Always confirm critical decisions with institutional protocols and qualified clinicians.";
}

export function buildCalculatorContentHtml(
  calc: Pick<SeedCalculator, "name" | "description" | "formulaPlain" | "outputs" | "category"> & {
    content?: SeedContentHints;
  },
): string {
  const hints = calc.content ?? {};
  const blocks: ContentBlock[] = [];

  blocks.push({
    id: "overview",
    heading: "What this calculator does",
    content:
      hints.overview ??
      `${calc.name} helps you estimate ${calc.description.charAt(0).toLowerCase()}${calc.description.slice(1)} The result is computed instantly in your browser and is intended for clinicians, students, and informed patients reviewing screening values.`,
  });

  blocks.push({
    id: "formula",
    heading: "Formula and variables",
    content:
      hints.formulaNotes ??
      `Displayed formula: ${calc.formulaPlain}\n\nThe engine evaluates: ${calc.outputs.map((o) => `${o.label}${o.unit ? ` (${o.unit})` : ""}`).join(", ")}. Variable names match the input field keys so you can trace each step from entry to output.`,
  });

  const steps = hints.howToUse ?? defaultHowToUse(calc.name);
  blocks.push({
    id: "how-to",
    heading: "How to use this tool",
    content: steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
  });

  if (hints.interpretation) {
    blocks.push({
      id: "interpretation",
      heading: "How to interpret the result",
      content: hints.interpretation,
    });
  } else {
    blocks.push({
      id: "interpretation",
      heading: "How to interpret the result",
      content:
        "Compare the calculated value with established reference intervals for your population. A single number rarely defines management—combine it with symptoms, trends over time, medications, and physical examination. If the result is unexpected, repeat the calculation with verified inputs before acting on it.",
    });
  }

  if (hints.clinicalNotes) {
    blocks.push({
      id: "clinical",
      heading: "Clinical context",
      content: hints.clinicalNotes,
    });
  }

  blocks.push({
    id: "limitations",
    heading: "Limitations and disclaimer",
    content: hints.limitations ?? defaultLimitations(),
  });

  if (hints.faq?.length) {
    blocks.push({
      id: "faq",
      heading: "Common questions",
      content: hints.faq.map((f) => `**${f.q}**\n${f.a}`).join("\n\n"),
    });
  }

  blocks.push({
    id: "category",
    heading: "Related tools",
    content: `Browse more calculators in the **${calc.category.replace(/-/g, " ")}** category on Medical Calculators to compare complementary screening and dosing tools.`,
  });

  return buildContentHtmlFromBlocks(blocks);
}
