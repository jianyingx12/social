import type { Account, ProductWorkspace, Tab } from "./types";

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
    scopes: ["Basic profile", "Comment workflows later", "Ideas later"],
    accent: "border-l-cyan-500",
  },
  {
    name: "Instagram",
    status: "Review scopes",
    scopes: ["Comment workflows later", "Insights later", "Ideas later"],
    accent: "border-l-rose-500",
  },
];

export const initialProductWorkspaces: ProductWorkspace[] = [];

export const productTabs: { id: Tab; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "brief", label: "Product brief" },
  { id: "resources", label: "Resources" },
  { id: "opportunities", label: "Research" },
  { id: "ideas", label: "Ideas" },
  { id: "review", label: "Review queue" },
];

export const globalTabs: { id: Tab; label: string }[] = [
  { id: "connect", label: "Connections" },
];
