import type { IntakePhaseId, ProductBriefUpdates, ProductWorkspace } from "@/lib/types";

type IntakePhase = {
  id: IntakePhaseId;
  label: string;
  title: string;
  question: string;
  fields: (keyof ProductBriefUpdates)[];
  examples: string[];
};

export const intakePhases: IntakePhase[] = [
  {
    id: "product",
    label: "Product",
    title: "What are we helping people discover?",
    question:
      "Describe the product in plain language: what it does, who it helps, and where someone can learn more.",
    fields: ["productType", "productUrl", "oneLine"],
    examples: [
      "It's a tool for...",
      "It helps people who...",
      "The product page is...",
    ],
  },
  {
    id: "customer",
    label: "Customer",
    title: "Who already feels this pain?",
    question:
      "Who is most likely to complain about this problem online, and what are they trying to do when it comes up?",
    fields: ["audience", "problem"],
    examples: [
      "The people who feel this most are...",
      "They complain about...",
      "They are trying to...",
    ],
  },
  {
    id: "outcome",
    label: "Outcome",
    title: "What useful outcome can we promise?",
    question:
      "What concrete improvement should a helpful reply or post point toward, even if nobody clicks a link?",
    fields: ["outcome"],
    examples: [
      "They can finally...",
      "They save time by...",
      "They avoid...",
    ],
  },
  {
    id: "positioning",
    label: "Positioning",
    title: "What makes this worth mentioning?",
    question:
      "Why would this be a relevant recommendation in a real conversation instead of a drive-by promotion?",
    fields: ["differentiator", "proof"],
    examples: [
      "It is relevant when...",
      "Unlike the usual workaround...",
      "The proof I can point to is...",
    ],
  },
  {
    id: "voice",
    label: "Voice",
    title: "How do we avoid sounding spammy?",
    question:
      "What tone should replies use, and what claims, tactics, or communities should we avoid?",
    fields: ["voice", "avoid"],
    examples: [
      "Sound like a helpful founder who...",
      "Avoid hard-selling...",
      "Do not mention the product when...",
    ],
  },
  {
    id: "listening",
    label: "Listening",
    title: "Where do demand signals show up?",
    question:
      "Where do these people ask for help, compare options, vent, or describe the pain in their own words?",
    fields: ["channels", "keywords"],
    examples: [
      "Subreddits or communities like...",
      "They might ask...",
      "Phrases they use include...",
    ],
  },
  {
    id: "ready",
    label: "Marketing",
    title: "What should we market next?",
    question:
      "I have enough context to help with organic marketing. Ask for reply angles, content ideas, listening channels, positioning feedback, or next actions.",
    fields: [],
    examples: [
      "Find helpful reply angles",
      "Suggest organic marketing actions",
      "Draft content ideas for this product",
    ],
  },
];

export function getCurrentIntakePhase(product: ProductWorkspace) {
  return intakePhases.find((phase) => !isPhaseComplete(product, phase)) ?? intakePhases.at(-1)!;
}

export function isPhaseComplete(product: ProductWorkspace, phase: IntakePhase) {
  if (phase.id === "ready") {
    return false;
  }

  if (phase.id === "product") {
    return hasBriefValue(product.oneLine);
  }

  if (phase.id === "customer") {
    return hasBriefValue(product.audience) && hasBriefValue(product.problem);
  }

  if (phase.id === "outcome") {
    return hasBriefValue(product.outcome);
  }

  return phase.fields.some((field) => hasBriefValue(product[field]));
}

function hasBriefValue(value: string) {
  return value.trim().length > 0 && value !== "Other";
}
