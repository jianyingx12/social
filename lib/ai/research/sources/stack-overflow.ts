import type { ResearchSource } from "../types";
import { sanitizeText } from "../text";

type StackExchangeItem = {
  title?: string;
  link?: string;
  body?: string;
  owner?: {
    display_name?: string;
  };
  score?: number;
  answer_count?: number;
  creation_date?: number;
};

type StackExchangeResponse = {
  items?: StackExchangeItem[];
};

export async function searchStackOverflow(queries: string[]) {
  const results = await Promise.all(
    queries.map(async (query) => {
      const params = new URLSearchParams({
        order: "desc",
        sort: "relevance",
        site: "stackoverflow",
        pagesize: "5",
        filter: "withbody",
        q: query,
      });
      const response = await fetch(`https://api.stackexchange.com/2.3/search/advanced?${params}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = (await response.json()) as StackExchangeResponse;

      return (data.items ?? []).map(normalizeStackExchangeItem).filter(Boolean);
    }),
  );

  return results
    .flat()
    .filter((source): source is ResearchSource => Boolean(source))
    .slice(0, 8);
}

function normalizeStackExchangeItem(item: StackExchangeItem): ResearchSource | null {
  const title = sanitizeText(item.title, 180);
  const url = sanitizeText(item.link, 500);
  const snippet = sanitizeText(item.body || title, 800);

  if (!title || !url || !snippet) {
    return null;
  }

  return {
    platform: "Stack Overflow",
    title,
    url,
    snippet,
    author: sanitizeText(item.owner?.display_name, 80),
    points: typeof item.score === "number" ? item.score : 0,
    comments: typeof item.answer_count === "number" ? item.answer_count : 0,
    date:
      typeof item.creation_date === "number"
        ? new Date(item.creation_date * 1000).toISOString()
        : "",
  };
}
