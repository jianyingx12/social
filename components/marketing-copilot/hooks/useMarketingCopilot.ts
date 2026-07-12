"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { initialAccounts } from "@/lib/marketing-data";
import { getContentIdeaBriefReadiness } from "@/lib/product-brief-readiness";
import type {
  AccountPlatform,
  ChatMessage,
  Draft,
  DraftOutcome,
  Opportunity,
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

type UseMarketingCopilotOptions = {
  enablePersistence?: boolean;
  initialProductId?: string;
  initialTab?: string;
  initialProductWorkspaces?: ProductWorkspace[];
};

export type WorkspaceSaveStatus = "disabled" | "idle" | "saving" | "saved" | "error";

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
  const [workspaceSaveStatus, setWorkspaceSaveStatus] = useState<WorkspaceSaveStatus>(
    enablePersistence ? "saved" : "disabled",
  );
  const hasMountedPersistence = useRef(false);
  const saveVersion = useRef(0);
  const { contentIdeaError, generateContentIdeas, isGeneratingContentIdeas } =
    useContentIdeaGeneration();
  const { generateResearch, isGeneratingResearch, researchError } = useResearchGeneration();

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

        if (nextAccounts.TikTok?.status === "Connected") {
          setConnectionNotice(getTikTokConnectionNotice({ status: "connected", reason: null }));
        }
      })
      .catch(() => undefined);
  }, [initialTikTokResult]);

  useEffect(() => {
    if (!enablePersistence) {
      return;
    }

    if (!hasMountedPersistence.current) {
      hasMountedPersistence.current = true;
      return;
    }

    const currentSaveVersion = saveVersion.current + 1;
    saveVersion.current = currentSaveVersion;

    const timeoutId = window.setTimeout(() => {
      setWorkspaceSaveStatus("saving");

      fetch("/api/workspaces", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Could not save workspace.");
          }

          if (saveVersion.current === currentSaveVersion) {
            setWorkspaceSaveStatus("saved");
          }
        })
        .catch(() => {
          if (saveVersion.current === currentSaveVersion) {
            setWorkspaceSaveStatus("error");
          }
        });
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [enablePersistence, products]);

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
    const approvedAt = new Date().toISOString();

    touchActiveProduct((product) => ({
      ...product,
      drafts: product.drafts.map((draft) =>
        draft.id === id
          ? {
              ...draft,
              status: "Approved",
              approvedAt,
              scheduledAt: undefined,
              time: "Approved. Choose a schedule time.",
            }
          : draft,
      ),
    }));
  }

  function scheduleDraft(id: number, scheduledFor: string) {
    const trimmedScheduledFor = scheduledFor.trim();

    if (!trimmedScheduledFor) {
      return;
    }

    touchActiveProduct((product) => ({
      ...product,
      drafts: product.drafts.map((draft) =>
        draft.id === id
          ? {
              ...draft,
              status: "Scheduled",
              scheduledAt: new Date().toISOString(),
              scheduledFor: trimmedScheduledFor,
              time: `Scheduled for ${formatScheduleTime(trimmedScheduledFor)}`,
            }
          : draft,
      ),
    }));
  }

  function markDraftPosted(id: number) {
    const postedAt = new Date().toISOString();

    touchActiveProduct((product) => ({
      ...product,
      drafts: product.drafts.map((draft) =>
        draft.id === id
          ? {
              ...draft,
              status: "Posted",
              postedAt,
              outcome: draft.outcome ?? "No response yet",
              time: "Posted. Track the result when you know it.",
            }
          : draft,
      ),
    }));
  }

  function updateDraftOutcome(
    id: number,
    updates: Partial<Pick<Draft, "postedUrl" | "outcomeNotes">> & {
      outcome?: DraftOutcome | "";
    },
  ) {
    touchActiveProduct((product) => ({
      ...product,
      drafts: product.drafts.map((draft) => {
        if (draft.id !== id) {
          return draft;
        }

        return {
          ...draft,
          ...updates,
          outcome: updates.outcome === "" ? undefined : updates.outcome,
        };
      }),
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

  async function generateContentPlan() {
    if (!activeProduct) {
      return;
    }

    const productId = activeProduct.id;

    await generateContentIdeas({
      product: activeProduct,
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
      drafts: product.drafts.map((draft) => {
        if (draft.id !== id) {
          return draft;
        }

        const copyChanged =
          (typeof updates.title === "string" && updates.title !== draft.title) ||
          (typeof updates.body === "string" && updates.body !== draft.body);

        if (!copyChanged) {
          return { ...draft, ...updates };
        }

        return {
          ...draft,
          ...updates,
          status: "Draft",
          approvedAt: undefined,
          scheduledAt: undefined,
          scheduledFor: undefined,
          postedAt: undefined,
          postedUrl: undefined,
          outcome: undefined,
          outcomeNotes: undefined,
          time: "Edited. Needs review.",
        };
      }),
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

    const draft: Draft = {
      id: Date.now(),
      platform: opportunity.platform,
      format: "Reply",
      status: "Draft",
      title: `Reply to: ${opportunity.title}`,
      body: [
        opportunity.suggestedReply,
        "",
        `Source: ${opportunity.source}`,
        opportunity.recommendedAction ? `Recommended action: ${opportunity.recommendedAction}` : "",
        opportunity.replyStrategy ? `Reply posture: ${opportunity.replyStrategy}` : "",
        opportunity.followUp ? `Follow-up: ${opportunity.followUp}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      time: "Ready for review",
    };

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

function formatScheduleTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function mergeOpportunities(current: Opportunity[], next: Opportunity[]) {
  const currentSources = new Set(current.map((opportunity) => opportunity.source));
  const uniqueNext = next.filter((opportunity) => !currentSources.has(opportunity.source));

  return [...uniqueNext, ...current];
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
    researchTargets: [],
    chatMessages: [],
    drafts: [],
    opportunities: [],
    contentIdeas: [],
  };
}

function createResearchTargets(product: ProductWorkspace): Omit<ResearchTarget, "id">[] {
  const keywords = splitSignals(product.keywords);
  const channels = splitSignals(product.channels);
  const problem = product.problem || product.oneLine || product.audience || product.name;
  const primaryKeyword = keywords[0] || product.oneLine || product.name;
  const communityQuery = channels[0] || product.audience || product.productType;

  return [
    {
      channel: "Search",
      query: `${primaryKeyword} problem`,
      signal: "People actively searching for help, alternatives, or how-to advice.",
      notes: "Look for recurring question wording, comparison searches, and pages ranking for pain-aware queries.",
    },
    {
      channel: "Reddit",
      query: `${communityQuery} ${problem}`,
      signal: "Complaints, help requests, workaround discussions, and recommendation threads.",
      notes: "Prioritize threads where a useful answer can stand on its own without a product mention.",
    },
    {
      channel: "YouTube",
      query: primaryKeyword,
      signal: "Comment sections where viewers ask follow-up questions or describe what tutorials missed.",
      notes: "Look for repeated confusion, requested tools, and comments comparing current workflows.",
    },
    {
      channel: "Review site",
      query: `${primaryKeyword} reviews alternatives`,
      signal: "Competitor praise, objections, missing features, and switching triggers.",
      notes: "Useful for positioning and reply angles, even if it does not produce direct conversations.",
    },
  ];
}

function splitSignals(value: string) {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getActiveProduct(products: ProductWorkspace[], activeProductId: string | null) {
  return products.find((product) => product.id === activeProductId) ?? null;
}

function getProductContext(product: ProductWorkspace) {
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
  ]
    .filter(Boolean)
    .join("\n\n");
}
