# OrganicReach App State

OrganicReach is an AI-assisted organic advertising workspace for founders. The app helps a user describe what they are building, research where demand is already showing up, draft useful organic responses, and keep every public action behind human review.

The product is not meant to be a generic chatbot, a social scheduler, or an auto-posting bot. The core idea is:

```txt
Product context -> Research -> Opportunities -> Drafts -> Review
```

The strongest version of the app starts with conversation, but it should not stay as a blank chat box. The chat should guide the user through a structured intake, build a product profile, and hand that context to the research and drafting layers.

## Current Product Direction

The app is moving toward a phase-based workflow:

1. The user talks with the AI about the product.
2. The AI fills or improves the product brief.
3. The user can manually edit the brief at any time.
4. The app builds a research plan across relevant channels.
5. Research produces demand signals and opportunities.
6. The AI drafts helpful replies or content ideas.
7. The user reviews and approves before anything public happens.

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
- Review queue
- Repurpose
- Connections

Product workspaces keep separate state for each product, including the brief, source material, chat messages, research targets, opportunities, drafts, and content ideas.

## Phase-Based Chat

The chat is being shaped around an AI Cofounder-style phase pattern, not its visual design.

The intended flow is:

```txt
Phase -> explanation -> focused question -> user answer -> brief update -> next phase
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

The current implementation can manually add research targets and seed a starter research plan from the product profile. It does not yet fetch live data from these sources.

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

An opportunity represents a conversation or demand signal worth acting on. It includes:

- platform
- source
- title
- intent
- fit score
- risk level
- suggested angle
- suggested reply

The old Opportunities view has been reframed as Research because opportunities should come from research, not appear as an isolated tab. Existing opportunity cards still support drafting replies into the review queue.

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

Draft statuses are:

- Draft
- Approved
- Scheduled

## Repurpose

Repurpose is a later-stage workflow. In the MVP, it creates content ideas with editable draft copy and attachment guidance. OpenAI can say what kind of image, video, link, or media would fit the draft, while the user chooses and attaches the actual asset.

This is useful, but it is secondary to the main discovery-first workflow. The app should first become good at understanding the product and finding demand.

## Connections

The app has early connection infrastructure for:

- Reddit
- TikTok
- Instagram placeholder/status

Reddit is important for the first research and opportunity discovery direction. TikTok is useful later for login, repurposing, analytics, and comment workflows.

Production connection work still needs:

- persistent database storage
- encrypted token storage
- refresh token handling
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
- Draft review queue
- Repurpose prototype
- Reddit and TikTok OAuth scaffolding

## What Is Not Done

- Real database persistence
- Encrypted token storage
- Live research fetching
- Real opportunity discovery from external sources
- AI summarization of fetched research
- Posting or scheduling to external platforms
- Production-grade auth and user accounts
- Billing/usage limits
- Automated tests for the main workflow

## Near-Term Priority

The next best product milestone is not more tabs. It is making the first loop work:

```txt
Chat intake -> brief populated -> research plan -> found signals -> draft reply -> review
```

A practical next implementation path:

1. Make phase-based intake feel polished and cheap to test.
2. Add a no-AI preview of what brief fields are filled.
3. Connect one low-cost research source or manual import path.
4. Turn research inputs into real opportunity objects.
5. Draft one helpful reply from one opportunity.
6. Keep approval explicit.

## Product Principle

OrganicReach should help founders be useful in places where demand already exists.

The app should not encourage spam, generic posting, or fake automation. It should research carefully, draft helpfully, and keep the human in control.
