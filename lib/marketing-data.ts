import type { Account, Community, Draft, ReplyDraft, Tab } from "./types";

export const initialAccounts: Account[] = [
  {
    name: "Reddit",
    status: "Not connected",
    scopes: ["Draft posts", "Read comments", "Community search"],
    accent: "border-l-orange-500",
  },
  {
    name: "TikTok",
    status: "Review scopes",
    scopes: ["Upload video", "Read analytics", "Schedule"],
    accent: "border-l-cyan-500",
  },
  {
    name: "Instagram",
    status: "Review scopes",
    scopes: ["Publish media", "Reply to comments", "Insights"],
    accent: "border-l-rose-500",
  },
];

export const initialDrafts: Draft[] = [];

export const communities: Community[] = [
  {
    name: "r/SaaS",
    fit: "High",
    reason: "Bootstrapped founders asking about distribution.",
  },
  {
    name: "r/startups",
    fit: "High",
    reason: "Useful for validation posts and workflow feedback.",
  },
  {
    name: "#buildinpublic",
    fit: "Medium",
    reason: "Works best with short product clips and lessons.",
  },
  {
    name: "Indie Hackers",
    fit: "Medium",
    reason: "Founder-led updates and early beta invitations.",
  },
];

export const replies: ReplyDraft[] = [
  {
    from: "Reddit comment",
    text: "Is this just Buffer with AI?",
    reply: "Short answer: the wedge is a review-first agent that also finds communities and drafts replies, not just a scheduler.",
  },
  {
    from: "Instagram DM",
    text: "Can it work for my next startup too?",
    reply: "Yes. The workspace stores reusable brand rules, connected channels, and approval preferences per startup.",
  },
];

export const selectedPlan = [
  "Turn the command into channel-specific campaign ideas.",
  "Draft one community post, one short video script, and one visual post concept.",
  "Queue every asset for approval before posting or scheduling.",
  "Watch comments and propose replies for review.",
];

export const tabs: { id: Tab; label: string }[] = [
  { id: "connect", label: "Accounts" },
  { id: "chat", label: "AI command" },
  { id: "approvals", label: "Approvals" },
  { id: "schedule", label: "Schedule" },
];

export function createDraftsFromCommand(command: string): Draft[] {
  const campaign = command.trim();

  if (!campaign) {
    return [];
  }

  return [
    {
      id: 1,
      platform: "Reddit",
      format: "Community post",
      status: "Draft",
      title: `Discussion post for: ${campaign}`,
      body: "Open with the problem, explain the product angle, ask for feedback, and invite specific objections from the community.",
      time: "Today, 4:30 PM",
    },
    {
      id: 2,
      platform: "TikTok",
      format: "30s video script",
      status: "Draft",
      title: `Short video concept for: ${campaign}`,
      body: "Hook with the pain point, show the before-and-after workflow, then end with a clear next step for interested viewers.",
      time: "Tomorrow, 10:00 AM",
    },
    {
      id: 3,
      platform: "Instagram",
      format: "Carousel",
      status: "Draft",
      title: `Carousel outline for: ${campaign}`,
      body: "Frame the promise, break down the key benefits, show a proof point, and close with a simple call to action.",
      time: "Friday, 9:15 AM",
    },
  ];
}
