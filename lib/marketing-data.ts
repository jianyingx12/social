import type { Account, Draft, Tab } from "./types";

export const initialAccounts: Account[] = [
  {
    name: "Reddit",
    status: "Not connected",
    scopes: ["Draft posts", "Read comments", "Community search"],
    accent: "border-l-orange-500",
  },
  {
    name: "TikTok",
    status: "Not connected",
    scopes: ["Basic profile", "Video draft prep", "Schedule later"],
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

export const tabs: { id: Tab; label: string }[] = [
  { id: "connect", label: "Accounts" },
  { id: "chat", label: "AI command" },
  { id: "approvals", label: "Approvals" },
  { id: "schedule", label: "Schedule" },
];
