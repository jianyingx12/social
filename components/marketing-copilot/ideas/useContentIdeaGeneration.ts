"use client";

import { useState } from "react";
import type { ContentIdea, ProductWorkspace } from "@/lib/types";

type GenerateContentIdeasParams = {
  onIdeas: (ideas: ContentIdea[]) => void;
  product: ProductWorkspace;
  source?: "brief" | "research";
};

export function useContentIdeaGeneration() {
  const [isGeneratingContentIdeas, setIsGeneratingContentIdeas] = useState(false);
  const [contentIdeaError, setContentIdeaError] = useState<string | null>(null);

  async function generateContentIdeas({
    onIdeas,
    product,
    source = "brief",
  }: GenerateContentIdeasParams) {
    if (isGeneratingContentIdeas) {
      return;
    }

    setIsGeneratingContentIdeas(true);
    setContentIdeaError(null);

    try {
      const response = await fetch("/api/ai/content-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product, source }),
      });
      const data = (await response.json()) as {
        ideas?: ContentIdea[];
        error?: string;
      };

      if (!response.ok || !data.ideas) {
        throw new Error(data.error ?? "Could not create content ideas.");
      }

      onIdeas(data.ideas);
    } catch (error) {
      setContentIdeaError(
        error instanceof Error ? error.message : "Could not create content ideas.",
      );
    } finally {
      setIsGeneratingContentIdeas(false);
    }
  }

  return {
    contentIdeaError,
    generateContentIdeas,
    isGeneratingContentIdeas,
  };
}
