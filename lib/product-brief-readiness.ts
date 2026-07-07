import type { ProductWorkspace } from "@/lib/types";

type RequiredBriefField = {
  field: keyof Pick<ProductWorkspace, "oneLine" | "audience" | "problem" | "outcome">;
  label: string;
};

const contentIdeaRequiredFields: RequiredBriefField[] = [
  { field: "oneLine", label: "One-line description" },
  { field: "audience", label: "Target audience" },
  { field: "problem", label: "Problem or desire" },
  { field: "outcome", label: "Main outcome promised" },
];

export function getContentIdeaBriefReadiness(product: ProductWorkspace) {
  const missingFields = contentIdeaRequiredFields
    .filter(({ field }) => !product[field].trim())
    .map(({ label }) => label);

  return {
    isReady: missingFields.length === 0,
    missingFields,
  };
}
