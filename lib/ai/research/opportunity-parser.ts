import type { Opportunity, Platform } from "@/lib/types";
import { enabledResearchPlatforms, opportunityActionTypes } from "./types";
import { parseJsonObject, sanitizeScore, sanitizeText } from "./text";

export function parseOpportunitiesResponse(text: string): Opportunity[] {
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

function sanitizeOpportunity(value: unknown): Omit<Opportunity, "id"> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;
  const platform = enabledResearchPlatforms.includes(source.platform as Platform)
    ? (source.platform as Platform)
    : null;
  const risk = ["Low", "Medium", "High"].includes(source.risk as string)
    ? (source.risk as Opportunity["risk"])
    : null;
  const title = sanitizeText(source.title, 180);
  const sourceUrl = sanitizeText(source.source, 500);
  const actionType = opportunityActionTypes.includes(
    source.actionType as (typeof opportunityActionTypes)[number],
  )
    ? (source.actionType as Opportunity["actionType"])
    : undefined;
  const intent = sanitizeText(source.intent, 500);
  const angle = sanitizeText(source.angle, 500);
  const signal = sanitizeText(source.signal, 500);
  const whyItFits = sanitizeText(source.whyItFits, 700);
  const recommendedAction = sanitizeText(source.recommendedAction, 700);
  const replyStrategy = sanitizeText(source.replyStrategy, 700);
  const followUp = sanitizeText(source.followUp, 700);
  const suggestedReply = sanitizeText(source.suggestedReply, 1800);
  const score = sanitizeScore(source.score);

  if (!platform || !risk || !title || !sourceUrl || !intent || !angle || !suggestedReply) {
    return null;
  }

  return {
    platform,
    source: sourceUrl,
    title,
    actionType,
    intent,
    score,
    risk,
    angle,
    signal,
    whyItFits,
    recommendedAction,
    replyStrategy,
    followUp,
    suggestedReply,
  };
}
