# OrganicReach App State

OrganicReach is an AI-assisted organic advertising workspace for founders. The app helps a user describe what they are building, research where demand is already showing up, draft useful organic responses, and keep every public action behind human review.

The product is not meant to be a generic chatbot, a social scheduler, or an auto-posting bot. The core idea is:

```txt
Product context -> Research -> Opportunities -> Ideas/Drafts -> Review + tracking
```

The strongest version of the app starts with conversation, but it should not stay as a blank chat box. The chat should guide the user through a structured intake, build a product profile, and hand that context to the research and drafting layers.

## Current Product Direction

The app is moving toward a phase-based workflow:

1. The user talks with the AI about the product.
2. The AI fills or improves the product brief.
3. The user can manually edit the brief at any time.
4. The app builds a research plan across relevant channels.
5. Research produces demand signals and organic marketing openings.
6. The AI drafts helpful replies or research-backed content ideas.
7. The user reviews, approves, posts manually, and tracks outcomes.

The important product promise is:

```txt
Tell OrganicReach what you sell. It researches where people already need it, then drafts helpful organic responses for approval.
```

## What Exists Now

The app currently has these main areas:

- Product workspaces
- Phase-based chat intake
- Product brief
- Source material
- Research
- Review + tracking queue
- Ideas
- Connections

Product workspaces keep separate state for each product, including the brief, source material, chat messages, research targets, opportunities, drafts, and content ideas.

Signed-in users now load and save product workspaces through Neon Postgres. The MVP persistence model stores each workspace as JSON per user, which keeps the app flexible while the product shape is still moving.

## Guided Chat

The chat is being shaped around an AI Cofounder-style guidance pattern, not its visual design.
The phase model is internal guidance for the AI, not a user-controlled workflow.

The intended flow is:

```txt
Current gap -> focused question -> user answer -> brief update or follow-up -> next useful question
```

The current intake phases are:

1. Product
2. Customer
3. Outcome
4. Positioning
5. Voice
6. Listening
7. Ready

These phases live in `components/marketing-copilot/chat/intake-phases.ts`.

Users should not have to manage these phases directly. The Chat surface shows product profile
strength and the next useful question, while the Product Brief remains the full manual editing
surface. The AI should push back when an answer is too vague or not actionable instead of filling
brief fields just to advance.

The prompts are tuned for organic advertising, not just generic product discovery. They ask for:

- what the product does
- who already feels the pain
- what useful outcome the product points toward
- why the product is relevant in real conversations
- how to avoid sounding spammy
- where demand signals show up
- what phrases customers use

The chat API sends the current intake phase to the backend so the model can stay focused. The AI response is expected to include a normal reply plus structured `briefUpdates`, which can prefill empty brief fields.

## Product Brief

The product brief is the structured memory of the product. It is not supposed to replace chat onboarding. Instead, it gives the user a manual control surface for everything the chat is learning.

The brief captures:

- product type
- product URL
- one-line description
- audience
- problem or desire
- outcome promised
- differentiator
- proof
- voice
- channels
- keywords
- avoid/rules
- extra notes

The brief remains editable because the user should always be able to correct the AI. If the user has extra product context, it should be summarized into the brief fields or extra notes instead of living in a separate hidden resource layer.

## Source Material

The old Resources tab is now treated as source material for drafts. This is not where the canonical product context lives. Product context belongs in the brief.

Source material lives in:

```txt
components/marketing-copilot/resources/
```

Source material can include:

- websites
- images
- videos
- social posts
- customer quotes
- testimonials
- case studies
- demo notes
- launch notes
- support tickets
- ad examples

The purpose of source material is to help the founder keep useful context nearby while creating draft content: replies, hooks, posts, proof points, and repurposed content. In the MVP, the AI can suggest what kind of image, video, link, or attachment would fit a content idea, but it does not evaluate resources or pick the actual asset. A research target is different: it is a place or query the app should investigate for demand signals.

## Research Layer

Research is the next major product layer.

Research should be channel-agnostic. Reddit is a strong first source because it has public, niche, conversation-heavy demand signals, but the product should not be Reddit-only.

The app now has a Research surface backed by `ResearchTarget` state. Research targets can point to:

- Search
- Reddit
- Hacker News
- Stack Overflow
- GitHub
- Indie Hackers
- YouTube
- TikTok
- Instagram
- LinkedIn
- X / Twitter
- niche forums
- review sites
- customer data
- other sources

Each research target captures:

- channel
- query, community, or dataset
- demand signal to look for
- notes about safety, usefulness, or risk

The current implementation can manually add research targets and seed a starter research plan from the product profile. These hints are also used as search inputs during automatic research so the user can steer future discovery.

The first automatic research sources are Hacker News, Stack Overflow, and GitHub issues. The Research view can run a live research pass from the current product brief and source hints. The backend searches public results from those sources, sends the normalized source set to OpenAI, and stores the resulting opportunity cards in the product workspace.

The purpose of research is to find:

- complaints
- help requests
- comparison posts
- workaround discussions
- buying triggers
- repeated questions
- competitor objections
- exact customer language
- safe moments to join a conversation

## Opportunities

Opportunities are the output of research.

An opportunity represents a conversation, signal, or market clue worth acting on through organic
marketing. It is not limited to "reply to this thread." The best action can be a direct reply,
content angle, positioning insight, audience habitat, objection to mine, or follow-up experiment.
It includes:

- platform
- source
- title
- action type
- intent
- demand signal
- fit score
- risk level
- suggested angle
- why the source fits
- recommended next action
- reply posture
- suggested follow-up
- suggested reply

The Research view shows organic openings as a ranked feed. Each research pass returns a small batch of opportunities, and the app merges new results by source URL, dedupes existing sources, and sorts by fit score so the highest-fit opportunities stay near the top. The user can run another pass from the bottom of the opportunity list to find more without turning the page into an unbounded result dump.

The old Opportunities view has been reframed as Research because opportunities should come from research, not appear as an isolated tab. Opportunity cards support drafting organic actions into the review queue, including the source URL and action guidance so review does not lose context.

## Drafts And Review

The review queue is a trust layer.

The AI can prepare replies, posts, and content ideas, but the founder should stay in control before anything goes public. This is a core product principle.

Current drafts support:

- platform
- format
- status
- title
- body
- time/state
- approval timestamp
- scheduled time
- posted timestamp
- posted link
- outcome
- outcome notes

Draft statuses are:

- Draft
- Approved
- Scheduled
- Posted

The MVP supports manual approval, scheduling metadata, and post-result tracking. A draft must be approved before scheduling or marking it posted is unlocked. Editing the title or body after approval moves the item back to Draft so changed copy can be reviewed again. Scheduling saves the plan in the product workspace, but it does not publish to external platforms yet. After manually posting, the user can mark a draft as Posted, save the public link, and record the result.

## Ideas

Ideas turns product context and research signals into reusable organic content. In the MVP, it creates content ideas with editable draft copy and attachment guidance. OpenAI can say what kind of image, video, link, or media would fit the draft, while the user chooses and attaches the actual asset.

Content idea generation is gated until the product brief has enough minimum context: one-line description, target audience, problem or desire, and main outcome promised. Without those fields, the app should ask the user to complete the brief instead of generating generic ideas.

Ideas can be generated from either the product brief or from research opportunities. Research-backed ideas include source opportunity title, source URL, and the demand signal they came from. Sending one to Review carries that research context into the draft.

This keeps the loop discovery-first: research does not only produce places to reply, it also becomes raw material for TikTok ideas, LinkedIn posts, X / Twitter threads, Reddit or Hacker News post angles, FAQ copy, and founder talking points.

## Connections

The app has early connection infrastructure for:

- Reddit
- TikTok
- Instagram placeholder/status

Reddit is important for the first research and opportunity discovery direction. TikTok is useful later for login, repurposing, analytics, and comment workflows.

Signed-in users can connect Reddit and TikTok accounts. OAuth start routes require an app user, store a verified OAuth state cookie, and redirect through the provider permission screen. OAuth callbacks store encrypted access and refresh tokens in Neon Postgres, then return users to Connections. Connection status routes return only safe account metadata to the browser. TikTok access tokens refresh server-side when needed.

Production connection work still needs:

- Reddit refresh token handling
- account-level permissions
- safer posting flows

## Current AI Behavior

The chat backend uses the OpenAI Responses API through `app/api/ai/chat/route.ts` and `lib/ai/marketing-chat.ts`.

The model is instructed to:

- act as OrganicReach
- focus on organic advertising intake
- stay inside the current intake phase
- ask focused follow-up questions
- infer brief fields only when reasonably confident
- avoid inventing proof, claims, URLs, connections, or actions
- favor demand signals and useful participation over generic ads
- return JSON shaped like:

```json
{
  "reply": "string",
  "briefUpdates": {}
}
```

The frontend merges returned brief updates only into empty fields, so manual user edits are preserved.

## What Is Done

- Basic app shell and sidebar
- Product workspace list and active product state
- Product rename flow
- Product brief form
- Source material section in its own folder
- Phase-based chat intake UI
- Organic advertising-focused intake prompts
- OpenAI chat API route
- Structured AI response parsing for `reply` and `briefUpdates`
- Research target domain model
- Research panel
- Seeded research target generation
- Automatic live research across Hacker News, Stack Overflow, and GitHub issues
- Ranked actionable opportunity cards with action plans
- Expandable research feed via follow-up research runs
- Draft review queue
- Manual approval and scheduling flow for drafts
- Posted/result tracking for drafts
- Brief-based and research-backed content ideas
- Reddit and TikTok OAuth scaffolding
- TikTok OAuth connection flow
- Neon-backed product workspace persistence
- Encrypted Reddit and TikTok OAuth token storage
- TikTok refresh token handling

## What Is Not Done

- Normalized relational tables for the full product workflow
- Reddit refresh token rotation and expiry recovery
- Additional live research sources beyond Hacker News, Stack Overflow, and GitHub
- True paginated source search for deeper "find more" research
- Posting to external platforms
- Billing/usage limits
- Automated tests for the main workflow

## Near-Term Priority

The next best product milestone is not more tabs. It is making the first loop work:

```txt
Chat intake -> brief populated -> research plan -> found signals -> reply/content draft -> review -> outcome tracking
```

A practical next implementation path:

1. Make phase-based intake feel polished and cheap to test.
2. Add a no-AI preview of what brief fields are filled.
3. Add more source-specific research fetchers.
4. Make "find more" search deeper instead of mostly rerunning the same source queries.
5. Improve draft generation from opportunity action plans.
6. Keep approval and outcome tracking explicit.

## Product Principle

OrganicReach should help founders be useful in places where demand already exists.

The app should not encourage spam, generic posting, or fake automation. It should research carefully, draft helpfully, and keep the human in control.
