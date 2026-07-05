import type { Account, ChatMessage, Draft, Opportunity, ProductWorkspace } from "@/lib/types";

type MarketingChatRequest = {
  messages: ChatMessage[];
  product: ProductWorkspace;
  drafts: Draft[];
  opportunities: Opportunity[];
  accounts: Account[];
};

type OpenAITextContent = {
  type?: string;
  text?: string;
};

type OpenAIOutputItem = {
  type?: string;
  content?: OpenAITextContent[];
};

type OpenAIResponse = {
  output_text?: string;
  output?: OpenAIOutputItem[];
  error?: {
    message?: string;
  };
};

const defaultModel = "gpt-5.5";

export function validateMarketingChatRequest(body: unknown): MarketingChatRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid chat request.");
  }

  const request = body as Partial<MarketingChatRequest>;

  if (!Array.isArray(request.messages) || !request.product) {
    throw new Error("Chat request is missing messages or product context.");
  }

  return {
    messages: request.messages.slice(-10),
    product: request.product,
    drafts: request.drafts ?? [],
    opportunities: request.opportunities ?? [],
    accounts: request.accounts ?? [],
  };
}

export async function createMarketingChatReply(request: MarketingChatRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? defaultModel,
      reasoning: { effort: "low" },
      instructions: buildInstructions(),
      input: buildInput(request),
    }),
  });

  const data = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? "OpenAI request failed.");
  }

  return extractResponseText(data);
}

function buildInstructions() {
  return [
    "You are OrganicReach, a practical founder-led marketing copilot.",
    "Use the provided product workspace as context.",
    "Help the user clarify positioning, find demand signals, draft replies, and plan TikTok or community content.",
    "Do not claim you posted, searched live communities, or changed connected accounts unless the context says that happened.",
    "Keep answers concise, specific, and action-oriented.",
    "When a public post or reply is suggested, make it useful even if nobody clicks a link.",
  ].join("\n");
}

function buildInput({ messages, product, drafts, opportunities, accounts }: MarketingChatRequest) {
  return [
    {
      role: "developer",
      content: buildContext(product, drafts, opportunities, accounts),
    },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];
}

function buildContext(
  product: ProductWorkspace,
  drafts: Draft[],
  opportunities: Opportunity[],
  accounts: Account[],
) {
  const resources = product.resources
    .map((resource) => `- ${resource.type}: ${resource.title}\n  ${resource.body}`)
    .join("\n");
  const opportunitySummary = opportunities
    .slice(0, 5)
    .map((opportunity) => `- ${opportunity.platform}: ${opportunity.title} (${opportunity.score}% fit)`)
    .join("\n");
  const draftSummary = drafts
    .slice(0, 5)
    .map((draft) => `- ${draft.platform}: ${draft.title} [${draft.status}]`)
    .join("\n");
  const accountSummary = accounts
    .map((account) => `- ${account.name}: ${account.status}${account.handle ? ` as ${account.handle}` : ""}`)
    .join("\n");

  return [
    `Active product: ${product.name}`,
    `Audience: ${product.audience || "Not provided"}`,
    `Brief: ${product.brief || "Not provided"}`,
    `Resources:\n${resources || "- None yet"}`,
    `Current opportunities:\n${opportunitySummary || "- None yet"}`,
    `Review queue:\n${draftSummary || "- Empty"}`,
    `Connected accounts:\n${accountSummary || "- None"}`,
  ].join("\n\n");
}

function extractResponseText(data: OpenAIResponse) {
  if (data.output_text) {
    return data.output_text;
  }

  const text = data.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("The model returned an empty response.");
  }

  return text;
}
