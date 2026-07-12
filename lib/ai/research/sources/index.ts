import type { ResearchSource } from "../types";
import { searchGitHubIssues } from "./github-issues";
import { searchHackerNews } from "./hacker-news";
import { searchStackOverflow } from "./stack-overflow";

const maxSources = 30;

export async function searchResearchSources(queries: string[]) {
  const results = await Promise.all([
    searchHackerNews(queries),
    searchStackOverflow(queries),
    searchGitHubIssues(queries),
  ]);

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
