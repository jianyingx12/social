import {
  createMarketingChatReply,
  validateMarketingChatRequest,
} from "@/lib/ai/marketing-chat";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const chatRequest = validateMarketingChatRequest(body);
    const reply = await createMarketingChatReply(chatRequest);

    return Response.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create a chat reply.";

    return Response.json({ error: message }, { status: 400 });
  }
}
