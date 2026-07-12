import type { Opportunity } from "@/lib/types";
import { analyzeSourcesWithOpenAI } from "./research/openai";
import { buildResearchQueries, hasEnoughResearchContext } from "./research/queries";
import { searchResearchSources } from "./research/sources";
import type { ResearchOpportunitiesRequest } from "./research/types";

export function validateResearchOpportunitiesRequest(
  body: unknown,
): ResearchOpportunitiesRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid research request.");
  }

  const request = body as Partial<ResearchOpportunitiesRequest>;

  if (!request.product) {
    throw new Error("Research request is missing product context.");
  }

  if (!hasEnoughResearchContext(request.product)) {
    throw new Error(
      "Complete at least the one-line description, target audience, or problem before running research.",
    );
  }

  return {
    product: request.product,
  };
}

export async function createResearchOpportunities({
  product,
}: ResearchOpportunitiesRequest): Promise<Opportunity[]> {
  const sources = await searchResearchSources(buildResearchQueries(product));

  if (sources.length === 0) {
    throw new Error("The enabled research sources did not return any usable results.");
  }

  const opportunities = await analyzeSourcesWithOpenAI(product, sources);

  if (opportunities.length === 0) {
    throw new Error("The research pass did not find usable opportunities.");
  }

  return opportunities;
}
