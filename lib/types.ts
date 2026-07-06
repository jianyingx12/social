export type Platform =
  | "Reddit"
  | "Hacker News"
  | "Indie Hackers"
  | "YouTube"
  | "TikTok"
  | "Instagram";

export type AccountPlatform = "Reddit" | "TikTok" | "Instagram";

export type Tab =
  | "chat"
  | "brief"
  | "resources"
  | "opportunities"
  | "review"
  | "connect"
  | "repurpose"
  | "products";

export type ProductType =
  | "Software / website"
  | "Physical product"
  | "Book"
  | "Course"
  | "Service"
  | "Creator brand"
  | "Other";

export type ProductResourceType =
  | "Document"
  | "Website"
  | "Image"
  | "Video"
  | "Social post"
  | "Customer note"
  | "Customer quote"
  | "Testimonial"
  | "Case study"
  | "Demo"
  | "Launch note"
  | "Support ticket"
  | "Ad example"
  | "Competitor"
  | "Community"
  | "FAQ";

export type ProductResource = {
  id: number;
  type: ProductResourceType;
  title: string;
  body: string;
};

export type ResearchChannel =
  | "Reddit"
  | "Hacker News"
  | "Indie Hackers"
  | "YouTube"
  | "TikTok"
  | "Instagram"
  | "LinkedIn"
  | "X / Twitter"
  | "Niche forum"
  | "Search"
  | "Review site"
  | "Customer data"
  | "Other";

export type ResearchTarget = {
  id: number;
  channel: ResearchChannel;
  query: string;
  signal: string;
  notes: string;
};

export type ProductWorkspace = {
  id: string;
  name: string;
  productType: ProductType;
  productUrl: string;
  oneLine: string;
  audience: string;
  problem: string;
  outcome: string;
  differentiator: string;
  proof: string;
  voice: string;
  channels: string;
  keywords: string;
  avoid: string;
  brief: string;
  resources: ProductResource[];
  researchTargets: ResearchTarget[];
  chatMessages: ChatMessage[];
  drafts: Draft[];
  opportunities: Opportunity[];
  tiktokIdeas: TikTokIdea[];
};

export type ProductBriefUpdates = Partial<
  Pick<
    ProductWorkspace,
    | "productType"
    | "productUrl"
    | "oneLine"
    | "audience"
    | "problem"
    | "outcome"
    | "differentiator"
    | "proof"
    | "voice"
    | "channels"
    | "keywords"
    | "avoid"
    | "brief"
  >
>;

export type ChatRole = "user" | "assistant";

export type IntakePhaseId =
  | "product"
  | "customer"
  | "outcome"
  | "positioning"
  | "voice"
  | "listening"
  | "ready";

export type ChatMessage = {
  id: number;
  role: ChatRole;
  content: string;
};

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
