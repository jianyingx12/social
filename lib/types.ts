export type Platform = "Reddit" | "TikTok" | "Instagram";

export type Tab = "connect" | "chat" | "approvals" | "schedule";

export type Account = {
  name: Platform;
  handle?: string;
  status: "Connected" | "Not connected" | "Review scopes";
  scopes: string[];
  accent: string;
};

export type Draft = {
  id: number;
  platform: Platform;
  format: string;
  status: "Draft" | "Approved" | "Scheduled";
  title: string;
  body: string;
  time: string;
};
