import type { Opportunity, ProductWorkspace, ResearchTarget } from "@/lib/types";

export function mergeOpportunities(current: Opportunity[], next: Opportunity[]) {
  const currentSources = new Set(current.map((opportunity) => opportunity.source));
  const uniqueNext = next.filter((opportunity) => !currentSources.has(opportunity.source));

  return [...uniqueNext, ...current].sort((first, second) => second.score - first.score);
}

export function createResearchTargets(product: ProductWorkspace): Omit<ResearchTarget, "id">[] {
  const keywords = splitSignals(product.keywords);
  const channels = splitSignals(product.channels);
  const problem = product.problem || product.oneLine || product.audience || product.name;
  const primaryKeyword = keywords[0] || product.oneLine || product.name;
  const communityQuery = channels[0] || product.audience || product.productType;

  return [
    {
      channel: "Search",
      query: `${primaryKeyword} problem`,
      signal: "People actively searching for help, alternatives, or how-to advice.",
      notes: "Look for recurring question wording, comparison searches, and pages ranking for pain-aware queries.",
    },
    {
      channel: "Reddit",
      query: `${communityQuery} ${problem}`,
      signal: "Complaints, help requests, workaround discussions, and recommendation threads.",
      notes: "Prioritize threads where a useful answer can stand on its own without a product mention.",
    },
    {
      channel: "YouTube",
      query: primaryKeyword,
      signal: "Comment sections where viewers ask follow-up questions or describe what tutorials missed.",
      notes: "Look for repeated confusion, requested tools, and comments comparing current workflows.",
    },
    {
      channel: "Review site",
      query: `${primaryKeyword} reviews alternatives`,
      signal: "Competitor praise, objections, missing features, and switching triggers.",
      notes: "Useful for positioning and reply angles, even if it does not produce direct conversations.",
    },
  ];
}

function splitSignals(value: string) {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
