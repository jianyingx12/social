# Product Marketing Copilot Overview

Product Marketing Copilot is a review-first AI marketing workspace for founders who want help turning any product or startup idea into social content without giving up control.

The product starts with connected social accounts. A user links channels like Reddit, TikTok, and Instagram through platform permission screens, then the app can prepare content for those destinations. The safest early version keeps posting permission behind a human approval step instead of letting the AI publish automatically.

The core workflow is simple: the founder tells the AI what to market, the AI creates campaign drafts, the founder reviews the work, and approved content can be posted or scheduled. A campaign command becomes a set of recommended posts, video ideas, carousel concepts, community targets, and comment replies.

The app is meant to behave less like a blank social media scheduler and more like a marketing operator. It should understand the selected product, suggest where the audience might be, draft platform-native content, and keep a queue of work that the founder can approve. The same workflow can be reused for future products with a new brand brief, connected accounts, and launch goals.

The MVP focuses on four product areas:

- Account connections for Reddit, TikTok, and Instagram
- An AI command workspace where the user describes what to market
- An approval queue for drafts, replies, and campaign assets
- A schedule view that shows what is approved and ready to publish

The first real connection milestone is Reddit OAuth. The app sends users to Reddit's permission screen, validates the callback, exchanges the authorization code, and records the connected Reddit username for the workspace. In a production version, access and refresh tokens should be stored encrypted in server-side storage rather than treated as UI state.

The guiding principle is trust. AI can draft, recommend, rank, and prepare, but the founder stays in control before anything goes live.
