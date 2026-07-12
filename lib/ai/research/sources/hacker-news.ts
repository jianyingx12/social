import type { ResearchSource } from "../types";
import { sanitizeText } from "../text";

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

export async function searchHackerNews(queries: string[]) {
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

  return results
    .flat()
    .filter((source): source is ResearchSource => Boolean(source))
    .slice(0, 8);
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
    platform: "Hacker News",
    title,
    url,
    snippet,
    author: sanitizeText(hit.author, 80),
    points: typeof hit.points === "number" ? hit.points : 0,
    comments: typeof hit.num_comments === "number" ? hit.num_comments : 0,
    date: sanitizeText(hit.created_at, 40),
  };
}
