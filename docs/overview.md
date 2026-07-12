# OrganicReach Overview

OrganicReach is an AI growth agent for founders. The product helps a founder find places where people are already talking about problems their product solves, then drafts useful responses, posts, and follow-ups for the founder to review.

The product is not meant to be another generic social scheduler. A scheduler starts with the question, "What should I post today?" OrganicReach starts with a better question: "Where on the internet are people already asking for something like this?"

For a product like ChalkReel, OrganicReach should be able to find relevant conversations in places like Reddit, Hacker News, Indie Hackers, Discord, Slack, YouTube comments, and other community spaces. It can notice a thread where a coach asks for basketball play drawing software, rank that thread as a good opportunity, and draft a helpful reply that the founder can approve.

The most important early workflow is:

1. The founder describes the product, audience, and launch goal.
2. OrganicReach searches conversation-based platforms for relevant discussions.
3. The app ranks opportunities by relevance, intent, and risk.
4. AI turns research into action plans, reply drafts, or reusable content ideas.
5. The founder reviews, edits, and approves.
6. Approved content is manually posted, scheduled, or copied into the right channel.
7. The founder records outcomes so future review can learn what worked.

Reddit is the clearest first channel because it is built around public discussions, niche communities, and question-driven threads. That makes it possible for OrganicReach to act like a marketing operator instead of a posting bot. The product can help founders find useful moments to join conversations without manually searching every community themselves.

The first implemented automatic research sources are Hacker News, Stack Overflow, and GitHub issues because they are public, low-cost to query, and useful for startup, software, AI, developer, and founder-oriented products. Research runs return small ranked batches of opportunities, sorted by fit score, with the ability to run another pass for more. The same research pipeline should later support Reddit, search APIs, YouTube, TikTok, LinkedIn, X / Twitter, review sites, and other source-specific fetchers.

Instagram, TikTok, LinkedIn, X / Twitter, and similar broadcast channels still have a role, but they are secondary. They are better for repurposing and learning than for discovering demand. For the MVP, OrganicReach can generate content ideas from either the product brief or from research opportunities, with editable draft copy and guidance on what kind of image, video, link, or other media to attach. The founder still chooses the actual asset and approves the final post.

The MVP should focus on four product areas:

- Opportunity discovery across conversation platforms
- AI-drafted replies and posts based on real conversations
- Research-backed content ideas for repurposing demand signals
- A review and tracking queue where the founder approves everything before it goes live and records outcomes afterward
- Account connections that support identity, posting, and future analytics

The connection system is infrastructure. Users can connect accounts through platform permission screens, and the app records enough identity information to show connection status. The safest early version keeps posting permission behind a human approval step instead of letting the AI publish automatically.

The first real connection milestones are OAuth identity connections for Reddit and TikTok. Reddit supports the core opportunity-discovery direction. TikTok is useful later for Login Kit, content repurposing, analytics, and comment workflows. The TikTok callback path is `/api/auth/callback/tiktok`. In production, access and refresh tokens should be stored encrypted in server-side storage rather than treated as UI state.

The guiding principle is trust. OrganicReach can find, draft, rank, recommend, and prepare, but the founder stays in control before anything goes live.

For the current implementation state and planned workflow, see [app-state.md](app-state.md). For database, auth, and token storage details, see [storage.md](storage.md).
