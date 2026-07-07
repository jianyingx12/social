import {
  createResearchOpportunities,
  validateResearchOpportunitiesRequest,
} from "@/lib/ai/research-opportunities";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const researchRequest = validateResearchOpportunitiesRequest(body);
    const opportunities = await createResearchOpportunities(researchRequest);

    return Response.json({ opportunities });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not run research.";

    return Response.json({ error: message }, { status: 400 });
  }
}
