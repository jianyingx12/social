import type { Platform, ProductWorkspace } from "@/lib/types";

export type ResearchOpportunitiesRequest = {
  product: ProductWorkspace;
};

export type ResearchSource = {
  platform: Platform;
  title: string;
  url: string;
  snippet: string;
  author: string;
  points: number;
  comments: number;
  date: string;
};

export type OpenAITextContent = {
  type?: string;
  text?: string;
};

export type OpenAIOutputItem = {
  type?: string;
  content?: OpenAITextContent[];
};

export type OpenAIResponse = {
  output_text?: string;
  output?: OpenAIOutputItem[];
  error?: {
    message?: string;
  };
};

export const enabledResearchPlatforms: Platform[] = [
  "Hacker News",
  "Stack Overflow",
  "GitHub",
];

export const opportunityActionTypes = [
  "Direct reply",
  "Content angle",
  "Positioning insight",
  "Audience habitat",
  "Objection mining",
  "Follow-up experiment",
] as const;
