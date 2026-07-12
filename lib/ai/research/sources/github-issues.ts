import type { ResearchSource } from "../types";
import { sanitizeText } from "../text";

type GitHubIssueItem = {
  html_url?: string;
  title?: string;
  body?: string;
  comments?: number;
  created_at?: string;
  user?: {
    login?: string;
  };
};

type GitHubIssueResponse = {
  items?: GitHubIssueItem[];
};

export async function searchGitHubIssues(queries: string[]) {
  const results = await Promise.all(
    queries.map(async (query) => {
      const params = new URLSearchParams({
        q: `${query} in:title,body is:issue`,
        per_page: "5",
        sort: "comments",
        order: "desc",
      });
      const response = await fetch(`https://api.github.com/search/issues?${params}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "OrganicReach-MVP",
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = (await response.json()) as GitHubIssueResponse;

      return (data.items ?? []).map(normalizeGitHubIssue).filter(Boolean);
    }),
  );

  return results
    .flat()
    .filter((source): source is ResearchSource => Boolean(source))
    .slice(0, 8);
}

function normalizeGitHubIssue(item: GitHubIssueItem): ResearchSource | null {
  const title = sanitizeText(item.title, 180);
  const url = sanitizeText(item.html_url, 500);
  const snippet = sanitizeText(item.body || title, 800);

  if (!title || !url || !snippet) {
    return null;
  }

  return {
    platform: "GitHub",
    title,
    url,
    snippet,
    author: sanitizeText(item.user?.login, 80),
    points: 0,
    comments: typeof item.comments === "number" ? item.comments : 0,
    date: sanitizeText(item.created_at, 40),
  };
}
