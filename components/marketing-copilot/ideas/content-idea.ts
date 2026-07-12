import type { ContentIdea, Draft } from "@/lib/types";

export function createDraftFromContentIdea(idea: ContentIdea): Draft {
  return {
    id: Date.now(),
    platform: idea.platform,
    format: idea.format,
    status: "Draft",
    title: idea.title,
    body: [
      idea.body,
      "",
      `Suggested attachment: ${idea.attachmentSuggestion}`,
      `Angle: ${idea.angle}`,
      idea.sourceOpportunityTitle ? `Source signal: ${idea.sourceOpportunityTitle}` : "",
      idea.sourceSignal ? `Research signal: ${idea.sourceSignal}` : "",
      idea.sourceOpportunityUrl ? `Source URL: ${idea.sourceOpportunityUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    time: "Ready to edit",
  };
}
