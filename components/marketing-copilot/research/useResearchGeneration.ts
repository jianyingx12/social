"use client";

import { useState } from "react";
import type { Opportunity, ProductWorkspace } from "@/lib/types";

type GenerateResearchParams = {
  onOpportunities: (opportunities: Opportunity[]) => void;
  product: ProductWorkspace;
};

export function useResearchGeneration() {
  const [isGeneratingResearch, setIsGeneratingResearch] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);

  async function generateResearch({ onOpportunities, product }: GenerateResearchParams) {
    if (isGeneratingResearch) {
      return;
    }

    setIsGeneratingResearch(true);
    setResearchError(null);

    try {
      const response = await fetch("/api/ai/research-opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product }),
      });
      const data = (await response.json()) as {
        opportunities?: Opportunity[];
        error?: string;
      };

      if (!response.ok || !data.opportunities) {
        throw new Error(data.error ?? "Could not run research.");
      }

      onOpportunities(data.opportunities);
    } catch (error) {
      setResearchError(error instanceof Error ? error.message : "Could not run research.");
    } finally {
      setIsGeneratingResearch(false);
    }
  }

  return {
    generateResearch,
    isGeneratingResearch,
    researchError,
  };
}
