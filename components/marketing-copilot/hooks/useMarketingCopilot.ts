"use client";

import { useEffect, useState } from "react";
import {
  initialAccounts,
  initialProductWorkspaces,
} from "@/lib/marketing-data";
import type {
  AccountPlatform,
  ChatMessage,
  Draft,
  ProductBriefUpdates,
  ProductResource,
  ProductWorkspace,
  Tab,
} from "@/lib/types";
import {
  getInitialTikTokResult,
  getTikTokConnectionNotice,
  type ConnectionNotice,
} from "../../connections/connection-notices";
import {
  disconnectAccount,
  loadConnectionStatuses,
  markAccountDisconnected,
  mergeConnectedAccounts,
} from "../../connections/connection-status";
import { createDraftFromTikTokIdea, generateTikTokIdeas } from "../repurpose/tiktok-content";

export function useMarketingCopilot() {
  const [initialTikTokResult] = useState(getInitialTikTokResult);
  const initialConnectionNotice = initialTikTokResult
    ? getTikTokConnectionNotice(initialTikTokResult)
    : null;
  const [activeTab, setActiveTab] = useState<Tab>(
    initialConnectionNotice ? "connect" : "products",
  );
  const [accounts, setAccounts] = useState(initialAccounts);
  const [products, setProducts] = useState(initialProductWorkspaces);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [connectionNotice, setConnectionNotice] =
    useState<ConnectionNotice | null>(initialConnectionNotice);

  const activeProduct = getActiveProduct(products, activeProductId);
  const drafts = activeProduct?.drafts ?? [];
  const opportunities = activeProduct?.opportunities ?? [];
  const tiktokIdeas = activeProduct?.tiktokIdeas ?? [];

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

    setProducts((current) => [nextProduct, ...current]);
    setActiveProductId(nextProduct.id);
    setActiveTab("brief");
  }

  function deleteProduct(id: string) {
    const productToDelete = products.find((product) => product.id === id);

    if (!productToDelete) {
      return;
    }

    const remainingProducts = products.filter((product) => product.id !== id);

    setProducts(remainingProducts);

    if (activeProductId === id) {
      setActiveProductId(null);
      setActiveTab("products");
    }
  }

  function selectProduct(id: string) {
    setActiveProductId(id);
    setActiveTab("chat");
  }

  function deselectProduct() {
    setActiveProductId(null);
    setActiveTab("products");
  }

  function updateActiveProduct(updates: ProductBriefUpdates) {
    touchActiveProduct((product) => ({ ...product, ...updates }));
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

    touchActiveProduct((product) => ({
      ...product,
      resources: [nextResource, ...product.resources],
    }));
  }

  function removeProductResource(id: number) {
    touchActiveProduct((product) => ({
      ...product,
      resources: product.resources.filter((resource) => resource.id !== id),
    }));
  }

  function updateChatMessages(messages: ChatMessage[]) {
    touchActiveProduct((product) => ({ ...product, chatMessages: messages }));
  }

  function generateTikTokPlan() {
    if (!activeProduct) {
      return;
    }

    const approvedDrafts = drafts.filter((draft) => draft.status !== "Draft");
    const nextIdeas = generateTikTokIdeas({
      approvedDrafts,
      brief: getProductContext(activeProduct),
    });

    touchActiveProduct((product) => ({ ...product, tiktokIdeas: nextIdeas }));
  }

  function sendTikTokIdeaToReview(id: number) {
    const idea = tiktokIdeas.find((item) => item.id === id);

    if (!idea) {
      return;
    }

    touchActiveProduct((product) => ({
      ...product,
      drafts: [createDraftFromTikTokIdea(idea), ...product.drafts],
    }));
    setActiveTab("review");
  }

  function generatePlan() {
    if (!activeProduct) {
      return;
    }

    const productContext = getProductContext(activeProduct);

    if (!productContext.trim()) {
      return;
    }

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

    touchActiveProduct((product) => ({ ...product, drafts: [draft, ...product.drafts] }));
    setActiveTab("review");
  }

  function updateDraftStatus(id: number, status: Draft["status"]) {
    touchActiveProduct((product) => ({
      ...product,
      drafts: product.drafts.map((draft) => (draft.id === id ? { ...draft, status } : draft)),
    }));
  }

  return {
    accounts,
    activeTab,
    activeProduct,
    activeProductId,
    connectionNotice,
    drafts,
    opportunities,
    products,
    tiktokIdeas,
    addProductResource,
    approveDraft,
    connectAccount,
    createProduct,
    deleteProduct,
    deselectProduct,
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
    updateChatMessages,
    updateActiveProduct,
  };

  function touchActiveProduct(update: (product: ProductWorkspace) => ProductWorkspace) {
    if (!activeProductId) {
      return;
    }

    setProducts((current) => {
      const product = current.find((item) => item.id === activeProductId);

      if (!product) {
        return current;
      }

      const updatedProduct = update(product);
      const otherProducts = current.filter((item) => item.id !== activeProductId);

      return [updatedProduct, ...otherProducts];
    });
  }
}

function createBlankProduct(name: string): ProductWorkspace {
  return {
    id: `product-${Date.now()}`,
    name,
    productType: "Other",
    productUrl: "",
    oneLine: "",
    audience: "",
    problem: "",
    outcome: "",
    differentiator: "",
    proof: "",
    voice: "",
    channels: "",
    keywords: "",
    avoid: "",
    brief: "",
    resources: [],
    chatMessages: [],
    drafts: [],
    opportunities: [],
    tiktokIdeas: [],
  };
}

function getActiveProduct(products: ProductWorkspace[], activeProductId: string | null) {
  return products.find((product) => product.id === activeProductId) ?? null;
}

function getProductContext(product: ProductWorkspace) {
  const resources = product.resources
    .map((resource) => `${resource.type}: ${resource.title}\n${resource.body}`)
    .join("\n\n");

  return [
    `Product type: ${product.productType}`,
    product.oneLine ? `One-line description: ${product.oneLine}` : "",
    product.productUrl ? `Link: ${product.productUrl}` : "",
    product.audience ? `Audience: ${product.audience}` : "",
    product.problem ? `Problem/desire: ${product.problem}` : "",
    product.outcome ? `Outcome promised: ${product.outcome}` : "",
    product.differentiator ? `Differentiator: ${product.differentiator}` : "",
    product.proof ? `Proof: ${product.proof}` : "",
    product.voice ? `Voice: ${product.voice}` : "",
    product.channels ? `Channels: ${product.channels}` : "",
    product.keywords ? `Keywords: ${product.keywords}` : "",
    product.avoid ? `Avoid/rules: ${product.avoid}` : "",
    product.brief ? `Extra notes: ${product.brief}` : "",
    resources ? `Resources:\n${resources}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
