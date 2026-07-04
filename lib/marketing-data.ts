import type { Account, Draft, Opportunity, Tab } from "./types";

export const initialAccounts: Account[] = [
  {
    name: "Reddit",
    status: "Not connected",
    scopes: ["Identity", "Find relevant threads", "Reply after approval"],
    accent: "border-l-orange-500",
  },
  {
    name: "TikTok",
    status: "Not connected",
    scopes: ["Basic profile", "Comment workflows later", "Repurpose later"],
    accent: "border-l-cyan-500",
  },
  {
    name: "Instagram",
    status: "Review scopes",
    scopes: ["Comment workflows later", "Insights later", "Repurpose later"],
    accent: "border-l-rose-500",
  },
];

export const initialDrafts: Draft[] = [];

export const initialOpportunities: Opportunity[] = [];

export const tabs: { id: Tab; label: string }[] = [
  { id: "opportunities", label: "Opportunities" },
  { id: "brief", label: "Product brief" },
  { id: "review", label: "Review queue" },
  { id: "repurpose", label: "Repurpose" },
  { id: "connect", label: "Connections" },
];
