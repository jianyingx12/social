import type { ContentIdea, Draft, Platform, ProductWorkspace } from "@/lib/types";

type ContentIdeasRequest = {
  product: ProductWorkspace;
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

  const hasProductContext = [
    request.product.name,
    request.product.oneLine,
    request.product.audience,
    request.product.problem,
    request.product.outcome,
    request.product.brief,
  ].some((value) => value.trim());

  if (!hasProductContext) {
    throw new Error("Add product context before creating content ideas.");
  }

  return {
    product: request.product,
  };
}

export async function createContentIdeas({
  product,
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
      instructions: buildInstructions(),
      input: buildInput(product),
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

function buildInstructions() {
  return [
    "You are OrganicReach, a practical founder-led marketing copilot.",
    "Create social content ideas from the product workspace.",
    "Each idea must include ready-to-edit post copy plus a suggested attachment direction.",
    "You may suggest the kind of media the user should attach, such as a screenshot, product image, short demo clip, customer quote graphic, carousel, link, or no attachment.",
    "Do not evaluate uploaded resources, choose a specific user asset, imply you inspected an image or video, or claim any media is already attached.",
    "The user will choose and attach the real image, video, link, or other media themselves.",
    "Stay grounded in the provided product context, customer pain, outcome, proof, voice, channels, and avoid rules.",
    "Do not invent proof, metrics, customer quotes, connected accounts, public actions, or live research.",
    "Make each post useful even if nobody clicks a link. Avoid hard selling, hype, fake urgency, and engagement bait.",
    "Return only valid JSON in this exact shape: {\"ideas\":[{\"platform\":\"Reddit|Hacker News|Indie Hackers|YouTube|TikTok|Instagram|LinkedIn|X / Twitter\",\"format\":\"Post|Image post|Carousel\",\"title\":\"string\",\"body\":\"string\",\"attachmentSuggestion\":\"string\",\"angle\":\"string\"}]}",
    "Return 3 ideas.",
  ].join("\n");
}

function buildInput(product: ProductWorkspace) {
  return [
    {
      role: "developer",
      content: buildContext(product),
    },
    {
      role: "user",
      content:
        "Create content ideas with draft copy and tell me what kind of media or attachment would fit each one.",
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
