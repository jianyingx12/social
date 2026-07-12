import type { ProductWorkspace } from "@/lib/types";
import { parseOpportunitiesResponse } from "./opportunity-parser";
import type { OpenAIResponse, ResearchSource } from "./types";

const defaultModel = "gpt-5.5";

export async function analyzeSourcesWithOpenAI(
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
    "Analyze public discussion and issue search results against the product brief to find organic marketing openings.",
    "Research is broader than developer thread matching. Look for demand signals, audience habitats, content angles, positioning clues, objections, comparison intent, confusion, and safe participation paths.",
    "Only create opportunities from sources that show plausible demand, pain, comparison intent, confusion, objections, audience language, or discussion the founder can join helpfully.",
    "Treat an opportunity as actionable only when a founder can take a specific organic marketing step: reply, answer a question, share a useful resource, join a discussion, learn from objections, draft a low-risk follow-up, create content from a repeated question, or adjust positioning.",
    "Do not invent source facts, metrics, comments, or claims.",
    "The suggested reply or draft must be useful and non-spammy. It should answer or contribute first, and mention the product only if genuinely relevant.",
    "The recommended action must be concrete enough that a user knows what to do in the next 5 minutes.",
    "The reply strategy should explain how to participate or act without sounding promotional.",
    "Prefer specific customer language and practical angles over generic marketing copy.",
    "Score should reflect relevance, urgency, and how safe/helpful it is to engage.",
    "Use actionType to classify the best next organic marketing move as one of: Direct reply, Content angle, Positioning insight, Audience habitat, Objection mining, Follow-up experiment.",
    "Return only valid JSON in this exact shape: {\"opportunities\":[{\"platform\":\"Hacker News|Stack Overflow|GitHub\",\"source\":\"string\",\"title\":\"string\",\"actionType\":\"Direct reply|Content angle|Positioning insight|Audience habitat|Objection mining|Follow-up experiment\",\"intent\":\"string\",\"signal\":\"string\",\"score\":0,\"risk\":\"Low|Medium|High\",\"angle\":\"string\",\"whyItFits\":\"string\",\"recommendedAction\":\"string\",\"replyStrategy\":\"string\",\"followUp\":\"string\",\"suggestedReply\":\"string\"}]}",
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
        "Find the strongest organic opportunities in these public research results and draft useful replies for review.",
    },
  ];
}

function buildContext(product: ProductWorkspace, sources: ResearchSource[]) {
  const sourceSummary = sources
    .map(
      (source, index) =>
        [
          `Source ${index + 1}: ${source.title}`,
          `Platform: ${source.platform}`,
          `URL: ${source.url}`,
          `Author: ${source.author || "Unknown"}`,
          `Points: ${source.points}`,
          `Comments: ${source.comments}`,
          `Date: ${source.date || "Unknown"}`,
          `Snippet: ${source.snippet}`,
        ].join("\n"),
    )
    .join("\n\n");
  const targetSummary = product.researchTargets
    .map(
      (target) =>
        [
          `- ${target.channel}: ${target.query}`,
          `  Signal to look for: ${target.signal}`,
          target.notes ? `  Notes: ${target.notes}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
    )
    .join("\n");

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
    `User-provided research hints:\n${targetSummary || "- None provided"}`,
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
