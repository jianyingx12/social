import type { ContentIdea, Draft, Platform, ProductWorkspace } from "@/lib/types";
import { getContentIdeaBriefReadiness } from "@/lib/product-brief-readiness";

type ContentIdeasRequest = {
  product: ProductWorkspace;
  source: "brief" | "research";
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
const platforms: Platform[] = [
  "Reddit",
  "Hacker News",
  "Indie Hackers",
  "YouTube",
  "TikTok",
  "Instagram",
  "LinkedIn",
  "X / Twitter",
];

const draftFormats: Draft["format"][] = ["Post", "Image post", "Carousel"];

export function validateContentIdeasRequest(body: unknown): ContentIdeasRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid content ideas request.");
  }

  const request = body as Partial<ContentIdeasRequest>;

  if (!request.product) {
    throw new Error("Content ideas request is missing product context.");
  }
  const source = request.source === "research" ? "research" : "brief";

  const readiness = getContentIdeaBriefReadiness(request.product);

  if (!readiness.isReady) {
    throw new Error(
      `Complete the product brief before creating content ideas. Missing: ${readiness.missingFields.join(", ")}.`,
    );
  }

  if (source === "research" && request.product.opportunities.length === 0) {
    throw new Error("Run research before creating research-backed content ideas.");
  }

  return {
    product: request.product,
    source,
  };
}

export async function createContentIdeas({
  product,
  source,
}: ContentIdeasRequest): Promise<ContentIdea[]> {
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
      instructions: buildInstructions(source),
      input: buildInput(product, source),
    }),
  });

  const data = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? "OpenAI request failed.");
  }

  const ideas = parseContentIdeasResponse(extractResponseText(data));

  if (ideas.length === 0) {
    throw new Error("The model did not return usable content ideas.");
  }

  return ideas;
}

function buildInstructions(source: ContentIdeasRequest["source"]) {
  return [
    "You are OrganicReach, a practical founder-led marketing copilot.",
    source === "research"
      ? "Create social content ideas from the product workspace and the provided research opportunities."
      : "Create social content ideas from the product workspace.",
    "Each idea must include ready-to-edit post copy plus a suggested attachment direction.",
    "You may suggest the kind of media the user should attach, such as a screenshot, product image, short demo clip, customer quote graphic, carousel, link, or no attachment.",
    "Do not evaluate uploaded resources, choose a specific user asset, imply you inspected an image or video, or claim any media is already attached.",
    "The user will choose and attach the real image, video, link, or other media themselves.",
    "Stay grounded in the provided product context, customer pain, outcome, proof, voice, channels, and avoid rules.",
    source === "research"
      ? "Use research opportunities as source material. Turn observed pain, questions, objections, and reply angles into reusable organic content."
      : "Do not invent proof, metrics, customer quotes, connected accounts, public actions, or live research.",
    "Do not invent proof, metrics, customer quotes, connected accounts, public actions, or source details.",
    "Make each post useful even if nobody clicks a link. Avoid hard selling, hype, fake urgency, and engagement bait.",
    source === "research"
      ? "When a content idea is based on a research opportunity, include sourceOpportunityTitle, sourceOpportunityUrl, and sourceSignal from the provided opportunity."
      : "Leave sourceOpportunityTitle, sourceOpportunityUrl, and sourceSignal empty unless a provided research opportunity directly supports the idea.",
    "Return only valid JSON in this exact shape: {\"ideas\":[{\"platform\":\"Reddit|Hacker News|Indie Hackers|YouTube|TikTok|Instagram|LinkedIn|X / Twitter\",\"format\":\"Post|Image post|Carousel\",\"title\":\"string\",\"body\":\"string\",\"attachmentSuggestion\":\"string\",\"angle\":\"string\",\"sourceOpportunityTitle\":\"string\",\"sourceOpportunityUrl\":\"string\",\"sourceSignal\":\"string\"}]}",
    "Return 3 ideas.",
  ].join("\n");
}

function buildInput(product: ProductWorkspace, source: ContentIdeasRequest["source"]) {
  return [
    {
      role: "developer",
      content: buildContext(product),
    },
    {
      role: "user",
      content:
        source === "research"
          ? "Create content ideas from the strongest research opportunities. Make each idea traceable to a source signal."
          : "Create content ideas with draft copy and tell me what kind of media or attachment would fit each one.",
    },
  ];
}

function buildContext(product: ProductWorkspace) {
  return [
    `Active product: ${product.name}`,
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
    `Research opportunities:\n${buildOpportunityContext(product)}`,
  ].join("\n\n");
}

function buildOpportunityContext(product: ProductWorkspace) {
  if (product.opportunities.length === 0) {
    return "- None yet";
  }

  return product.opportunities
    .slice(0, 8)
    .map((opportunity, index) =>
      [
        `Opportunity ${index + 1}: ${opportunity.title}`,
        `Platform: ${opportunity.platform}`,
        `Source: ${opportunity.source}`,
        `Intent: ${opportunity.intent}`,
        `Signal: ${opportunity.signal || "Not provided"}`,
        `Angle: ${opportunity.angle}`,
        `Why it fits: ${opportunity.whyItFits || "Not provided"}`,
        `Recommended action: ${opportunity.recommendedAction || "Not provided"}`,
        `Reply strategy: ${opportunity.replyStrategy || "Not provided"}`,
      ].join("\n"),
    )
    .join("\n\n");
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

function parseContentIdeasResponse(text: string): ContentIdea[] {
  const parsed = parseJsonObject(text);
  const ideas = Array.isArray(parsed?.ideas) ? parsed.ideas : [];

  return ideas
    .map(sanitizeIdea)
    .filter((idea): idea is Omit<ContentIdea, "id"> => Boolean(idea))
    .slice(0, 3)
    .map((idea, index) => ({
      ...idea,
      id: Date.now() + index,
    }));
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

function sanitizeIdea(value: unknown): Omit<ContentIdea, "id"> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;
  const platform = sanitizePlatform(source.platform);
  const format = sanitizeFormat(source.format);
  const title = sanitizeText(source.title, 140);
  const body = sanitizeText(source.body, 1800);
  const attachmentSuggestion = sanitizeText(source.attachmentSuggestion, 500);
  const angle = sanitizeText(source.angle, 240);
  const sourceOpportunityTitle = sanitizeText(source.sourceOpportunityTitle, 180);
  const sourceOpportunityUrl = sanitizeText(source.sourceOpportunityUrl, 500);
  const sourceSignal = sanitizeText(source.sourceSignal, 500);

  if (!platform || !format || !title || !body || !attachmentSuggestion || !angle) {
    return null;
  }

  return {
    platform,
    format,
    title,
    body,
    attachmentSuggestion,
    angle,
    sourceOpportunityTitle,
    sourceOpportunityUrl,
    sourceSignal,
  };
}

function sanitizePlatform(value: unknown): Platform | null {
  return platforms.includes(value as Platform) ? (value as Platform) : null;
}

function sanitizeFormat(value: unknown): Draft["format"] | null {
  return draftFormats.includes(value as Draft["format"]) ? (value as Draft["format"]) : null;
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+\n/g, "\n").trim().slice(0, maxLength);
}
