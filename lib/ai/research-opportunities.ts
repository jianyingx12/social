import type { Opportunity, Platform, ProductWorkspace } from "@/lib/types";

type ResearchOpportunitiesRequest = {
  product: ProductWorkspace;
};

type HackerNewsHit = {
  objectID?: string;
  title?: string;
  story_title?: string;
  url?: string;
  story_url?: string;
  author?: string;
  points?: number;
  num_comments?: number;
  created_at?: string;
  comment_text?: string;
  story_text?: string;
};

type HackerNewsResponse = {
  hits?: HackerNewsHit[];
};

type ResearchSource = {
  title: string;
  url: string;
  snippet: string;
  author: string;
  points: number;
  comments: number;
  date: string;
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
const maxQueries = 4;
const maxSources = 16;
const platforms: Platform[] = ["Hacker News"];

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
  const sources = await searchHackerNews(buildResearchQueries(product));

  if (sources.length === 0) {
    throw new Error("Hacker News did not return any usable research sources.");
  }

  const opportunities = await analyzeSourcesWithOpenAI(product, sources);

  if (opportunities.length === 0) {
    throw new Error("The research pass did not find usable opportunities.");
  }

  return opportunities;
}

function hasEnoughResearchContext(product: ProductWorkspace) {
  return Boolean(
    product.oneLine.trim() ||
      product.problem.trim() ||
      product.audience.trim() ||
      product.keywords.trim(),
  );
}

function buildResearchQueries(product: ProductWorkspace) {
  const rawQueries = [
    product.problem,
    product.oneLine,
    product.keywords,
    product.audience,
    `${product.problem || product.oneLine} alternative`,
    `${product.problem || product.oneLine} tool`,
  ];

  return Array.from(
    new Set(
      rawQueries
        .flatMap((query) => query.split(/[,;\n]/))
        .map((query) => query.trim())
        .filter((query) => query.length >= 3),
    ),
  ).slice(0, maxQueries);
}

async function searchHackerNews(queries: string[]) {
  const results = await Promise.all(
    queries.map(async (query) => {
      const params = new URLSearchParams({
        query,
        hitsPerPage: "6",
      });
      const response = await fetch(`https://hn.algolia.com/api/v1/search?${params}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = (await response.json()) as HackerNewsResponse;

      return (data.hits ?? []).map(normalizeHackerNewsHit).filter(Boolean);
    }),
  );

  const seenUrls = new Set<string>();

  return results
    .flat()
    .filter((source): source is ResearchSource => Boolean(source))
    .filter((source) => {
      if (seenUrls.has(source.url)) {
        return false;
      }

      seenUrls.add(source.url);

      return true;
    })
    .slice(0, maxSources);
}

function normalizeHackerNewsHit(hit: HackerNewsHit): ResearchSource | null {
  const title = sanitizeText(hit.title || hit.story_title, 180);
  const hnUrl = hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : "";
  const url = sanitizeText(hit.url || hit.story_url || hnUrl, 500);
  const snippet = sanitizeText(hit.comment_text || hit.story_text || title, 800);

  if (!title || !url || !snippet) {
    return null;
  }

  return {
    title,
    url,
    snippet,
    author: sanitizeText(hit.author, 80),
    points: typeof hit.points === "number" ? hit.points : 0,
    comments: typeof hit.num_comments === "number" ? hit.num_comments : 0,
    date: sanitizeText(hit.created_at, 40),
  };
}

async function analyzeSourcesWithOpenAI(
  product: ProductWorkspace,
  sources: ResearchSource[],
) {
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
      input: buildInput(product, sources),
    }),
  });

  const data = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? "OpenAI request failed.");
  }

  return parseOpportunitiesResponse(extractResponseText(data));
}

function buildInstructions() {
  return [
    "You are OrganicReach, an organic marketing research agent.",
    "Analyze Hacker News search results against the product brief.",
    "Only create opportunities from sources that show plausible demand, pain, comparison intent, confusion, objections, or discussion the founder can join helpfully.",
    "Do not invent source facts, metrics, comments, or claims.",
    "The suggested reply must be useful and non-spammy. It should answer or contribute first, and mention the product only if genuinely relevant.",
    "Prefer specific customer language and practical angles over generic marketing copy.",
    "Return only valid JSON in this exact shape: {\"opportunities\":[{\"platform\":\"Hacker News\",\"source\":\"string\",\"title\":\"string\",\"intent\":\"string\",\"score\":0,\"risk\":\"Low|Medium|High\",\"angle\":\"string\",\"suggestedReply\":\"string\"}]}",
    "Return up to 5 opportunities.",
  ].join("\n");
}

function buildInput(product: ProductWorkspace, sources: ResearchSource[]) {
  return [
    {
      role: "developer",
      content: buildContext(product, sources),
    },
    {
      role: "user",
      content:
        "Find the strongest organic opportunities in these Hacker News results and draft useful replies for review.",
    },
  ];
}

function buildContext(product: ProductWorkspace, sources: ResearchSource[]) {
  const sourceSummary = sources
    .map(
      (source, index) =>
        [
          `Source ${index + 1}: ${source.title}`,
          `URL: ${source.url}`,
          `Author: ${source.author || "Unknown"}`,
          `Points: ${source.points}`,
          `Comments: ${source.comments}`,
          `Date: ${source.date || "Unknown"}`,
          `Snippet: ${source.snippet}`,
        ].join("\n"),
    )
    .join("\n\n");

  return [
    `Active product: ${product.name}`,
    `Product type: ${product.productType}`,
    `One-line description: ${product.oneLine || "Not provided"}`,
    `Audience: ${product.audience || "Not provided"}`,
    `Problem/desire: ${product.problem || "Not provided"}`,
    `Outcome promised: ${product.outcome || "Not provided"}`,
    `Differentiator: ${product.differentiator || "Not provided"}`,
    `Proof: ${product.proof || "Not provided"}`,
    `Voice: ${product.voice || "Not provided"}`,
    `Keywords/customer language: ${product.keywords || "Not provided"}`,
    `Avoid/rules: ${product.avoid || "Not provided"}`,
    `Sources:\n${sourceSummary}`,
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

function parseOpportunitiesResponse(text: string): Opportunity[] {
  const parsed = parseJsonObject(text);
  const opportunities = Array.isArray(parsed?.opportunities) ? parsed.opportunities : [];

  return opportunities
    .map(sanitizeOpportunity)
    .filter((opportunity): opportunity is Omit<Opportunity, "id"> => Boolean(opportunity))
    .slice(0, 5)
    .map((opportunity, index) => ({
      ...opportunity,
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

function sanitizeOpportunity(value: unknown): Omit<Opportunity, "id"> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;
  const platform = platforms.includes(source.platform as Platform)
    ? (source.platform as Platform)
    : null;
  const risk = ["Low", "Medium", "High"].includes(source.risk as string)
    ? (source.risk as Opportunity["risk"])
    : null;
  const title = sanitizeText(source.title, 180);
  const sourceUrl = sanitizeText(source.source, 500);
  const intent = sanitizeText(source.intent, 500);
  const angle = sanitizeText(source.angle, 500);
  const suggestedReply = sanitizeText(source.suggestedReply, 1800);
  const score = sanitizeScore(source.score);

  if (!platform || !risk || !title || !sourceUrl || !intent || !angle || !suggestedReply) {
    return null;
  }

  return {
    platform,
    source: sourceUrl,
    title,
    intent,
    score,
    risk,
    angle,
    suggestedReply,
  };
}

function sanitizeScore(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 50;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
