import type { ProductWorkspace } from "@/lib/types";

type ProfileSignal = {
  field: keyof Pick<
    ProductWorkspace,
    | "oneLine"
    | "audience"
    | "problem"
    | "outcome"
    | "differentiator"
    | "voice"
    | "channels"
    | "keywords"
  >;
  label: string;
};

const profileSignals: ProfileSignal[] = [
  { field: "oneLine", label: "Product" },
  { field: "audience", label: "Audience" },
  { field: "problem", label: "Pain" },
  { field: "outcome", label: "Outcome" },
  { field: "differentiator", label: "Positioning" },
  { field: "voice", label: "Voice" },
  { field: "channels", label: "Channels" },
  { field: "keywords", label: "Language" },
];

export function getProfileGuidance(product: ProductWorkspace) {
  const completedSignals = profileSignals.filter(({ field }) => product[field].trim());
  const missingSignals = profileSignals.filter(({ field }) => !product[field].trim());
  const score = Math.round((completedSignals.length / profileSignals.length) * 100);

  return {
    completedCount: completedSignals.length,
    label: getProfileLabel(score),
    missingLabels: missingSignals.map(({ label }) => label),
    score,
    totalCount: profileSignals.length,
  };
}

function getProfileLabel(score: number) {
  if (score >= 75) {
    return "Strong";
  }

  if (score >= 50) {
    return "Ready";
  }

  if (score >= 25) {
    return "Building";
  }

  return "Starting";
}
