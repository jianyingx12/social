export type Platform =
  | "Reddit"
  | "Hacker News"
  | "Indie Hackers"
  | "YouTube"
  | "TikTok"
  | "Instagram";

export type AccountPlatform = "Reddit" | "TikTok" | "Instagram";

export type Tab = "brief" | "opportunities" | "review" | "connect" | "repurpose";

export type Account = {
  name: AccountPlatform;
  handle?: string;
  status: "Connected" | "Not connected" | "Review scopes";
  scopes: string[];
  accent: string;
};

export type Draft = {
  id: number;
  platform: Platform;
  format: "Reply" | "Post" | "Short-form idea";
  status: "Draft" | "Approved" | "Scheduled";
  title: string;
  body: string;
  time: string;
};

export type TikTokIdea = {
  id: number;
  sourceTitle: string;
  hook: string;
  script: string;
  caption: string;
  callToAction: string;
  angle: string;
};

export type Opportunity = {
  id: number;
  platform: Platform;
  source: string;
  title: string;
  intent: string;
  score: number;
  risk: "Low" | "Medium" | "High";
  angle: string;
  suggestedReply: string;
};
