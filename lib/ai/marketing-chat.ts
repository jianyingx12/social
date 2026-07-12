import type {
  Account,
  ChatMessage,
  Draft,
  IntakePhaseId,
  Opportunity,
  ProductBriefUpdates,
  ProductType,
  ProductWorkspace,
} from "@/lib/types";

type MarketingChatRequest = {
  messages: ChatMessage[];
  intakePhase?: IntakePhaseId;
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
const productTypes: ProductType[] = [
  "Software / website",
  "Physical product",
  "Book",
  "Course",
  "Service",
  "Creator brand",
  "Other",
];
const briefUpdateFields = [
  "productType",
  "productUrl",
  "oneLine",
  "audience",
  "problem",
  "outcome",
  "differentiator",
  "proof",
  "voice",
  "channels",
  "keywords",
  "avoid",
  "brief",
] as const;

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
    intakePhase: request.intakePhase,
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

  return parseMarketingChatResponse(extractResponseText(data));
}

function buildInstructions() {
  return [
    "You are OrganicReach, a practical founder-led marketing copilot.",
    "Your first job is organic advertising intake: understand the product, the buyer pain, customer language, listening channels, and how to helpfully enter real conversations.",
    "Use the provided product workspace as context. If important brief fields are missing, ask one or two focused follow-up questions instead of giving a generic menu.",
    "The current intake phase is internal guidance, not something to announce as a step number or checklist to the user.",
    "Stay inside the current intake phase unless the user clearly jumps ahead. Ask one focused next question for that phase.",
    "If the user's answer is too vague, generic, contradictory, or not actionable for organic marketing, push back gently and ask for a sharper answer. Do not mark a weak answer as usable just to progress.",
    "If the user asks for something outside OrganicReach's marketing workflow, briefly acknowledge it and redirect to product positioning, customer research, organic reply drafting, content ideas, source material, or approvals. Do not answer unrelated requests in depth.",
    "When the user provides product details, infer product brief fields from the conversation and return them in briefUpdates.",
    "Only include briefUpdates for fields you can infer with high confidence from the user's words or existing context.",
    "If you need to ask a follow-up before a field is reliable, leave that field out of briefUpdates.",
    "Never invent proof, URLs, claims, connected accounts, or public actions.",
    "Favor prompts and advice that reveal demand signals: complaints, comparison posts, help requests, workaround discussions, buying triggers, and exact customer phrases.",
    "Frame marketing as useful participation: answer the person's problem first, mention the product only when it is genuinely relevant, and keep public drafts non-spammy.",
    "After the profile has enough context, stop behaving like an intake form and help the user clarify organic positioning, find demand signals, draft helpful replies, and create content ideas with attachment guidance.",
    "Do not claim you posted, searched live communities, or changed connected accounts unless the context says that happened.",
    "Keep answers concise, specific, and action-oriented.",
    "When a public post or reply is suggested, make it useful even if nobody clicks a link.",
    "Return only valid JSON in this exact shape: {\"reply\":\"string\",\"briefUpdates\":{}}.",
    `briefUpdates may contain only these fields: ${briefUpdateFields.join(", ")}.`,
    `productType must be one of: ${productTypes.join(", ")}.`,
  ].join("\n");
}

function buildInput({
  messages,
  intakePhase,
  product,
  drafts,
  opportunities,
  accounts,
}: MarketingChatRequest) {
  return [
    {
      role: "developer",
      content: buildContext(product, drafts, opportunities, accounts, intakePhase),
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
  intakePhase?: IntakePhaseId,
) {
  const sourceMaterial = product.resources
    .map((resource) => `- ${resource.type}: ${resource.title}\n  ${resource.body}`)
    .join("\n");
  const researchTargetSummary = product.researchTargets
    .slice(0, 8)
    .map((target) => `- ${target.channel}: ${target.query}\n  Signal: ${target.signal}`)
    .join("\n");
  const opportunitySummary = opportunities
    .slice(0, 5)
    .map(
      (opportunity) =>
        `- ${opportunity.platform}: ${opportunity.title} (${opportunity.score}% fit${
          opportunity.actionType ? `, ${opportunity.actionType}` : ""
        })`,
    )
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
    `Current intake phase: ${intakePhase || "unknown"}`,
    `Product type: ${product.productType}`,
    `One-line description: ${product.oneLine || "Not provided"}`,
    `Link: ${product.productUrl || "Not provided"}`,
    `Audience: ${product.audience || "Not provided"}`,
    `Problem/desire: ${product.problem || "Not provided"}`,
    `Outcome promised: ${product.outcome || "Not provided"}`,
    `Differentiator: ${product.differentiator || "Not provided"}`,
    `Proof: ${product.proof || "Not provided"}`,
    `Brand voice: ${product.voice || "Not provided"}`,
    `Channels to consider: ${product.channels || "Not provided"}`,
    `Keywords/customer language: ${product.keywords || "Not provided"}`,
    `Avoid/rules: ${product.avoid || "Not provided"}`,
    `Extra brief notes: ${product.brief || "Not provided"}`,
    `Draft source material:\n${sourceMaterial || "- None yet"}`,
    `Research targets:\n${researchTargetSummary || "- None yet"}`,
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

function parseMarketingChatResponse(text: string) {
  const parsed = parseJsonObject(text);

  if (!parsed) {
    return {
      reply: text,
      briefUpdates: {},
    };
  }

  return {
    reply: typeof parsed.reply === "string" ? parsed.reply : text,
    briefUpdates: sanitizeBriefUpdates(parsed.briefUpdates),
  };
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function sanitizeBriefUpdates(value: unknown): ProductBriefUpdates {
  if (!value || typeof value !== "object") {
    return {};
  }

  const source = value as Record<string, unknown>;
  const updates: ProductBriefUpdates = {};

  for (const field of briefUpdateFields) {
    const fieldValue = source[field];

    if (typeof fieldValue !== "string" || !fieldValue.trim()) {
      continue;
    }

    if (field === "productType") {
      if (productTypes.includes(fieldValue as ProductType)) {
        updates.productType = fieldValue as ProductType;
      }
      continue;
    }

    updates[field] = fieldValue.trim();
  }

  return updates;
}
