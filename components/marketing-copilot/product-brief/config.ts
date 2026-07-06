import type { ProductBriefUpdates, ProductType } from "@/lib/types";

export type InterviewStep = "basics" | "audience" | "positioning" | "promotion" | "rules" | "notes";

export type InterviewStepConfig = {
  id: InterviewStep;
  label: string;
  title: string;
  prompt: string;
  fields: (keyof ProductBriefUpdates)[];
};

export const productTypes: ProductType[] = [
  "Software / website",
  "Physical product",
  "Book",
  "Course",
  "Service",
  "Creator brand",
  "Other",
];

export const interviewSteps: InterviewStepConfig[] = [
  {
    id: "basics",
    label: "Basics",
    title: "First, what are we promoting?",
    prompt:
      "Give me the shortest useful description. I only need enough to understand the product and where it lives.",
    fields: ["productType", "productUrl", "oneLine"],
  },
  {
    id: "audience",
    label: "Audience",
    title: "Who should care, and why now?",
    prompt:
      "The strongest organic posts come from a real person, a real pain, and a clear outcome.",
    fields: ["audience", "problem", "outcome"],
  },
  {
    id: "positioning",
    label: "Positioning",
    title: "What makes this worth noticing?",
    prompt:
      "Help me avoid generic content by giving me the proof, contrast, and voice behind the product.",
    fields: ["differentiator", "proof", "voice"],
  },
  {
    id: "promotion",
    label: "Promotion",
    title: "Where should we listen first?",
    prompt:
      "List the channels, communities, phrases, and customer language that might reveal demand.",
    fields: ["channels", "keywords"],
  },
  {
    id: "rules",
    label: "Rules",
    title: "What should the assistant avoid?",
    prompt:
      "Set the boundaries now so replies, posts, and short-form ideas stay true to the product.",
    fields: ["avoid"],
  },
  {
    id: "notes",
    label: "Notes",
    title: "Anything else I should know?",
    prompt:
      "Add launch context, pricing, current offers, founder perspective, or rough thoughts that do not fit elsewhere.",
    fields: ["brief"],
  },
];
