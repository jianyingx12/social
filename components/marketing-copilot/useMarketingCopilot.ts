"use client";

import { useEffect, useState } from "react";
import {
  initialAccounts,
  initialDrafts,
  initialOpportunities,
  initialProductWorkspaces,
} from "@/lib/marketing-data";
import type {
  AccountPlatform,
  Draft,
  Opportunity,
  ProductResource,
  ProductWorkspace,
  Tab,
} from "@/lib/types";
import {
  getInitialTikTokResult,
  getTikTokConnectionNotice,
  type ConnectionNotice,
} from "./connection-notices";
import {
  disconnectAccount,
  loadConnectionStatuses,
  markAccountDisconnected,
  mergeConnectedAccounts,
} from "./connection-status";
import { createDraftFromTikTokIdea, generateTikTokIdeas } from "./tiktok-content";
import type { TikTokIdea } from "@/lib/types";

const blankProductName = "Untitled product";

export function useMarketingCopilot() {
  const [initialTikTokResult] = useState(getInitialTikTokResult);
  const initialConnectionNotice = initialTikTokResult
    ? getTikTokConnectionNotice(initialTikTokResult)
    : null;
  const [activeTab, setActiveTab] = useState<Tab>(
    initialConnectionNotice ? "connect" : "chat",
  );
  const [accounts, setAccounts] = useState(initialAccounts);
  const [drafts, setDrafts] = useState(initialDrafts);
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [products, setProducts] = useState(initialProductWorkspaces);
  const [activeProductId, setActiveProductId] = useState(initialProductWorkspaces[0].id);
  const [tiktokIdeas, setTikTokIdeas] = useState<TikTokIdea[]>([]);
  const [connectionNotice, setConnectionNotice] =
    useState<ConnectionNotice | null>(initialConnectionNotice);

  const connectedCount = accounts.filter((account) => account.status === "Connected").length;
  const pendingCount = drafts.filter((draft) => draft.status === "Draft").length;
  const opportunityCount = opportunities.length;
  const activeProduct = getActiveProduct(products, activeProductId);
  const resourceCount = activeProduct.resources.length;

  useEffect(() => {
    if (initialTikTokResult) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    loadConnectionStatuses()
      .then(({ accounts: nextAccounts }) => {
        setAccounts((current) => mergeConnectedAccounts(current, nextAccounts));

        if (nextAccounts.TikTok?.status === "Connected") {
          setConnectionNotice(getTikTokConnectionNotice({ status: "connected", reason: null }));
        }
      })
      .catch(() => undefined);
  }, [initialTikTokResult]);

  function connectAccount(platform: AccountPlatform) {
    if (platform === "Reddit") {
      window.location.href = "/api/auth/reddit/start";
      return;
    }

    if (platform === "TikTok") {
      window.location.href = "/api/auth/tiktok/start";
      return;
    }

    setAccounts((current) =>
      current.map((account) =>
        account.name === platform ? { ...account, status: "Review scopes" } : account,
      ),
    );
  }

  function disconnectConnectedAccount(platform: AccountPlatform) {
    disconnectAccount(platform)
      .then(() => {
        setAccounts((current) => markAccountDisconnected(current, platform));
        setConnectionNotice(null);
      })
      .catch(() => undefined);
  }

  function approveDraft(id: number) {
    updateDraftStatus(id, "Approved");
  }

  function scheduleDraft(id: number) {
    updateDraftStatus(id, "Scheduled");
  }

  function createProduct() {
    const nextProduct = createBlankProduct(`Product ${products.length + 1}`);

    setProducts((current) => [...current, nextProduct]);
    setActiveProductId(nextProduct.id);
    setOpportunities([]);
    setTikTokIdeas([]);
    setActiveTab("brief");
  }

  function deleteProduct(id: string) {
    const productToDelete = products.find((product) => product.id === id);

    if (!productToDelete) {
      return;
    }

    const remainingProducts = products.filter((product) => product.id !== id);
    const nextProducts =
      remainingProducts.length > 0 ? remainingProducts : [createBlankProduct(blankProductName)];
    const nextActiveProduct = nextProducts[0];

    setProducts(nextProducts);
    setActiveProductId(nextActiveProduct.id);
    setOpportunities([]);
    setTikTokIdeas([]);
    setActiveTab("brief");
  }

  function selectProduct(id: string) {
    setActiveProductId(id);
    setOpportunities([]);
    setTikTokIdeas([]);
    setActiveTab("brief");
  }

  function updateActiveProduct(updates: Partial<Pick<ProductWorkspace, "audience" | "brief">>) {
    setProducts((current) =>
      current.map((product) =>
        product.id === activeProductId ? { ...product, ...updates } : product,
      ),
    );
  }

  function renameProduct(id: string, name: string) {
    setProducts((current) =>
      current.map((product) => (product.id === id ? { ...product, name } : product)),
    );
  }

  function addProductResource(resource: Omit<ProductResource, "id">) {
    const nextResource = {
      ...resource,
      id: Date.now(),
    };

    setProducts((current) =>
      current.map((product) =>
        product.id === activeProductId
          ? { ...product, resources: [nextResource, ...product.resources] }
          : product,
      ),
    );
  }

  function removeProductResource(id: number) {
    setProducts((current) =>
      current.map((product) =>
        product.id === activeProductId
          ? {
              ...product,
              resources: product.resources.filter((resource) => resource.id !== id),
            }
          : product,
      ),
    );
  }

  function generateTikTokPlan() {
    const approvedDrafts = drafts.filter((draft) => draft.status !== "Draft");
    const nextIdeas = generateTikTokIdeas({
      approvedDrafts,
      brief: getProductContext(activeProduct),
    });

    setTikTokIdeas(nextIdeas);
  }

  function sendTikTokIdeaToReview(id: number) {
    const idea = tiktokIdeas.find((item) => item.id === id);

    if (!idea) {
      return;
    }

    setDrafts((current) => [createDraftFromTikTokIdea(idea), ...current]);
    setActiveTab("review");
  }

  function generatePlan() {
    const productContext = getProductContext(activeProduct);

    if (!productContext.trim()) {
      return;
    }

    const nextOpportunities = createOpportunityPreview(productContext);
    setOpportunities(nextOpportunities);
    setActiveTab("opportunities");
  }

  function draftOpportunity(opportunityId: number) {
    const opportunity = opportunities.find((item) => item.id === opportunityId);

    if (!opportunity) {
      return;
    }

    const draft: Draft = {
      id: Date.now(),
      platform: opportunity.platform,
      format: "Reply",
      status: "Draft",
      title: `Reply to: ${opportunity.title}`,
      body: opportunity.suggestedReply,
      time: "Ready for review",
    };

    setDrafts((current) => [draft, ...current]);
    setActiveTab("review");
  }

  function updateDraftStatus(id: number, status: Draft["status"]) {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, status } : draft)),
    );
  }

  return {
    accounts,
    activeTab,
    activeProduct,
    activeProductId,
    connectionNotice,
    connectedCount,
    drafts,
    opportunities,
    opportunityCount,
    pendingCount,
    products,
    resourceCount,
    tiktokIdeas,
    addProductResource,
    approveDraft,
    connectAccount,
    createProduct,
    deleteProduct,
    disconnectConnectedAccount,
    draftOpportunity,
    generatePlan,
    generateTikTokPlan,
    removeProductResource,
    renameProduct,
    scheduleDraft,
    selectProduct,
    sendTikTokIdeaToReview,
    setActiveTab,
    updateActiveProduct,
  };
}

function createBlankProduct(name: string): ProductWorkspace {
  return {
    id: `product-${Date.now()}`,
    name,
    audience: "",
    brief: "",
    resources: [],
  };
}

function getActiveProduct(products: ProductWorkspace[], activeProductId: string) {
  return products.find((product) => product.id === activeProductId) ?? products[0];
}

function getProductContext(product: ProductWorkspace) {
  const resources = product.resources
    .map((resource) => `${resource.type}: ${resource.title}\n${resource.body}`)
    .join("\n\n");

  return [product.brief, product.audience ? `Audience: ${product.audience}` : "", resources]
    .filter(Boolean)
    .join("\n\n");
}

function createOpportunityPreview(brief: string): Opportunity[] {
  const product = brief.split(/[.!?\n]/)[0]?.trim() || "this product";

  return [
    {
      id: 1,
      platform: "Reddit",
      source: "r/startups",
      title: "How do you find early users without sounding spammy?",
      intent: "Founder is asking for practical growth channels",
      score: 91,
      risk: "Low",
      angle: `Share how ${product} looks for active problem discussions before writing any promotional post.`,
      suggestedReply:
        `A useful approach is to start with conversations, not posts. For ${product}, I would search for people already describing the problem, write a genuinely helpful reply, and only mention the product if it directly helps. The key is to make the reply valuable even if nobody clicks.`,
    },
    {
      id: 2,
      platform: "Hacker News",
      source: "Ask HN",
      title: "What tools are people using to do founder-led marketing?",
      intent: "Comparison and tool discovery",
      score: 84,
      risk: "Medium",
      angle: `Position ${product} as a way to find demand signals instead of scheduling generic posts.`,
      suggestedReply:
        `Most tools help after you already know what to say. The part I find more painful is finding where the right conversation is happening. ${product} is exploring that angle: monitor relevant communities, rank good moments to respond, then keep the founder in control before anything is posted.`,
    },
    {
      id: 3,
      platform: "YouTube",
      source: "Creator comment",
      title: "Does anyone know software for turning a product demo into shorts?",
      intent: "User is asking for repurposing help",
      score: 76,
      risk: "Low",
      angle: `Offer a practical repurposing workflow and mention ${product} only as context.`,
      suggestedReply:
        `One workflow that works: start with a real demo, pull out the strongest before/after moment, write one hook for the specific audience, and turn that into a short clip. ${product} is being shaped around that broader growth-agent workflow, especially when a useful community answer can become more content later.`,
    },
  ];
}
