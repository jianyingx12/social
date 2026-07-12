"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { initialAccounts } from "@/lib/marketing-data";
import { getContentIdeaBriefReadiness } from "@/lib/product-brief-readiness";
import type {
  AccountPlatform,
  ChatMessage,
  Draft,
  ProductBriefUpdates,
  ProductResource,
  ResearchTarget,
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
import { createDraftFromContentIdea } from "../ideas/content-idea";
import {
  createWorkspacePath,
  getInitialWorkspaceRouteState,
} from "../navigation/workspace-route";
import { useContentIdeaGeneration } from "../ideas/useContentIdeaGeneration";
import { useResearchGeneration } from "../research/useResearchGeneration";
import {
  approveDrafts,
  createDraftFromOpportunity,
  markDraftPostedInDrafts,
  scheduleDrafts,
  updateDraftCopyInDrafts,
  updateDraftOutcomeInDrafts,
  type DraftOutcomeUpdates,
} from "./draft-workflow";
import {
  createBlankProduct,
  getActiveProduct,
  getProductContext,
} from "./product-workspace";
import { createResearchTargets, mergeOpportunities } from "./research-workflow";
import {
  useWorkspaceAutosave,
  type WorkspaceSaveStatus,
} from "./useWorkspaceAutosave";

type UseMarketingCopilotOptions = {
  enablePersistence?: boolean;
  initialProductId?: string;
  initialTab?: string;
  initialProductWorkspaces?: ProductWorkspace[];
};

export type { WorkspaceSaveStatus };

export function useMarketingCopilot({
  enablePersistence = false,
  initialProductId,
  initialTab,
  initialProductWorkspaces = [],
}: UseMarketingCopilotOptions = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [initialTikTokResult] = useState(getInitialTikTokResult);
  const initialConnectionNotice = initialTikTokResult
    ? getTikTokConnectionNotice(initialTikTokResult)
    : null;
  const initialNavigationState = getInitialWorkspaceRouteState({
    fallbackTab: initialConnectionNotice ? "connect" : "products",
    productId: initialProductId,
    products: initialProductWorkspaces,
    tab: initialTab,
  });
  const [activeTab, setActiveTabState] = useState<Tab>(initialNavigationState.tab);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [products, setProducts] = useState(initialProductWorkspaces);
  const [activeProductId, setActiveProductId] = useState<string | null>(
    initialNavigationState.productId,
  );
  const [connectionNotice, setConnectionNotice] =
    useState<ConnectionNotice | null>(initialConnectionNotice);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);
  const { contentIdeaError, generateContentIdeas, isGeneratingContentIdeas } =
    useContentIdeaGeneration();
  const { generateResearch, isGeneratingResearch, researchError } = useResearchGeneration();
  const workspaceSaveStatus = useWorkspaceAutosave({ enablePersistence, products });

  const activeProduct = getActiveProduct(products, activeProductId);
  const drafts = activeProduct?.drafts ?? [];
  const opportunities = activeProduct?.opportunities ?? [];
  const researchTargets = activeProduct?.researchTargets ?? [];
  const contentIdeas = activeProduct?.contentIdeas ?? [];
  const contentIdeaReadiness = activeProduct
    ? getContentIdeaBriefReadiness(activeProduct)
    : { isReady: false, missingFields: [] };

  function setActiveTab(tab: Tab) {
    const nextProductId = tab === "products" ? null : activeProductId;

    setActiveProductId(nextProductId);
    setActiveTabState(tab);
    pushWorkspaceRoute({ productId: nextProductId, tab });
  }

  function pushWorkspaceRoute(state: { productId: string | null; tab: Tab }) {
    const nextPath = createWorkspacePath(state);

    if (nextPath === pathname) {
      return;
    }

    router.push(nextPath, { scroll: false });
  }

  useEffect(() => {
    if (initialTikTokResult) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    loadConnectionStatuses()
      .then(({ accounts: nextAccounts }) => {
        setAccounts((current) => mergeConnectedAccounts(current, nextAccounts));
      })
      .catch(() => undefined)
      .finally(() => setIsLoadingConnections(false));
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

  function dismissConnectionNotice() {
    setConnectionNotice(null);
  }

  function approveDraft(id: number) {
    touchActiveProduct((product) => ({
      ...product,
      drafts: approveDrafts(product.drafts, id),
    }));
  }

  function scheduleDraft(id: number, scheduledFor: string) {
    touchActiveProduct((product) => ({
      ...product,
      drafts: scheduleDrafts(product.drafts, id, scheduledFor),
    }));
  }

  function markDraftPosted(id: number) {
    touchActiveProduct((product) => ({
      ...product,
      drafts: markDraftPostedInDrafts(product.drafts, id),
    }));
  }

  function updateDraftOutcome(id: number, updates: DraftOutcomeUpdates) {
    touchActiveProduct((product) => ({
      ...product,
      drafts: updateDraftOutcomeInDrafts(product.drafts, id, updates),
    }));
  }

  function createProduct() {
    const nextProduct = createBlankProduct("Untitled");

    setProducts((current) => [nextProduct, ...current]);
    setActiveProductId(nextProduct.id);
    setActiveTabState("chat");
    pushWorkspaceRoute({ productId: nextProduct.id, tab: "chat" });
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
      setActiveTabState("products");
      pushWorkspaceRoute({ productId: null, tab: "products" });
    }
  }

  function selectProduct(id: string) {
    setActiveProductId(id);
    setActiveTabState("chat");
    pushWorkspaceRoute({ productId: id, tab: "chat" });
  }

  function deselectProduct() {
    setActiveProductId(null);
    setActiveTabState("products");
    pushWorkspaceRoute({ productId: null, tab: "products" });
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

  function addResearchTarget(target: Omit<ResearchTarget, "id">) {
    const nextTarget = {
      ...target,
      id: Date.now(),
    };

    touchActiveProduct((product) => ({
      ...product,
      researchTargets: [nextTarget, ...product.researchTargets],
    }));
  }

  function removeResearchTarget(id: number) {
    touchActiveProduct((product) => ({
      ...product,
      researchTargets: product.researchTargets.filter((target) => target.id !== id),
    }));
  }

  function generateResearchTargets() {
    if (!activeProduct) {
      return;
    }

    const nextTargets = createResearchTargets(activeProduct).filter(
      (target) =>
        !activeProduct.researchTargets.some(
          (current) =>
            current.channel === target.channel &&
            current.query.toLowerCase() === target.query.toLowerCase(),
        ),
    );

    if (nextTargets.length === 0) {
      return;
    }

    touchActiveProduct((product) => ({
      ...product,
      researchTargets: [
        ...nextTargets.map((target, index) => ({ ...target, id: Date.now() + index })),
        ...product.researchTargets,
      ],
    }));
  }

  async function runLiveResearch() {
    if (!activeProduct) {
      return;
    }

    const productId = activeProduct.id;

    await generateResearch({
      product: activeProduct,
      onOpportunities: (nextOpportunities) => {
        touchProduct(productId, (product) => ({
          ...product,
          opportunities: mergeOpportunities(product.opportunities, nextOpportunities),
        }));
      },
    });
  }

  function updateChatMessages(messages: ChatMessage[]) {
    touchActiveProduct((product) => ({ ...product, chatMessages: messages }));
  }

  async function generateContentPlan(source: "brief" | "research" = "brief") {
    if (!activeProduct) {
      return;
    }

    const productId = activeProduct.id;

    await generateContentIdeas({
      product: activeProduct,
      source,
      onIdeas: (ideas) => {
        touchProduct(productId, (product) => ({ ...product, contentIdeas: ideas }));
      },
    });
  }

  function sendContentIdeaToReview(id: number) {
    const idea = contentIdeas.find((item) => item.id === id);

    if (!idea) {
      return;
    }

    touchActiveProduct((product) => ({
      ...product,
      drafts: [createDraftFromContentIdea(idea), ...product.drafts],
    }));
    setActiveTab("review");
  }

  function updateDraft(id: number, updates: Partial<Pick<Draft, "title" | "body" | "scheduledFor">>) {
    touchActiveProduct((product) => ({
      ...product,
      drafts: updateDraftCopyInDrafts(product.drafts, id, updates),
    }));
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

    const draft = createDraftFromOpportunity(opportunity);
    touchActiveProduct((product) => ({ ...product, drafts: [draft, ...product.drafts] }));
    setActiveTab("review");
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
    researchError,
    researchTargets,
    workspaceSaveStatus,
    contentIdeaError,
    contentIdeas,
    contentIdeaReadiness,
    isGeneratingContentIdeas,
    isGeneratingResearch,
    isLoadingConnections,
    addProductResource,
    addResearchTarget,
    approveDraft,
    connectAccount,
    createProduct,
    deleteProduct,
    deselectProduct,
    disconnectConnectedAccount,
    dismissConnectionNotice,
    draftOpportunity,
    generatePlan,
    generateContentPlan,
    generateResearchTargets,
    markDraftPosted,
    runLiveResearch,
    removeProductResource,
    removeResearchTarget,
    renameProduct,
    scheduleDraft,
    selectProduct,
    sendContentIdeaToReview,
    setActiveTab,
    updateChatMessages,
    updateDraft,
    updateActiveProduct,
    updateDraftOutcome,
  };

  function touchActiveProduct(update: (product: ProductWorkspace) => ProductWorkspace) {
    if (!activeProductId) {
      return;
    }

    touchProduct(activeProductId, update);
  }

  function touchProduct(
    productId: string,
    update: (product: ProductWorkspace) => ProductWorkspace,
  ) {
    setProducts((current) => {
      const product = current.find((item) => item.id === productId);

      if (!product) {
        return current;
      }

      const updatedProduct = update(product);
      const otherProducts = current.filter((item) => item.id !== productId);

      return [updatedProduct, ...otherProducts];
    });
  }
}
