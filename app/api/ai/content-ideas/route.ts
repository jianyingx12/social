import { createContentIdeas, validateContentIdeasRequest } from "@/lib/ai/content-ideas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contentIdeasRequest = validateContentIdeasRequest(body);
    const ideas = await createContentIdeas(contentIdeasRequest);

    return Response.json({ ideas });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create content ideas.";

    return Response.json({ error: message }, { status: 400 });
  }
}
