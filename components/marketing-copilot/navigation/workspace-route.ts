import type { ProductWorkspace, Tab } from "@/lib/types";

export type WorkspaceRouteState = {
  productId: string | null;
  tab: Tab;
};

export type ProductRouteTab = Exclude<Tab, "connect" | "products">;

const validTabs: Tab[] = [
  "chat",
  "brief",
  "resources",
  "opportunities",
  "review",
  "connect",
  "ideas",
  "products",
];

const productTabs = new Set<ProductRouteTab>([
  "chat",
  "brief",
  "resources",
  "opportunities",
  "review",
  "ideas",
]);

const tabToSegment: Record<ProductRouteTab, string> = {
  chat: "chat",
  brief: "brief",
  resources: "resources",
  opportunities: "research",
  review: "review",
  ideas: "ideas",
};

const segmentToTab = Object.fromEntries(
  Object.entries(tabToSegment).map(([tab, segment]) => [segment, tab]),
) as Record<string, ProductRouteTab>;

export function getInitialWorkspaceRouteState({
  fallbackTab,
  productId,
  products,
  tab,
}: {
  fallbackTab: Tab;
  productId?: string;
  products: ProductWorkspace[];
  tab?: string;
}): WorkspaceRouteState {
  return normalizeWorkspaceRouteState({
    productId: productId || null,
    products,
    tab: parseTab(tab) ?? fallbackTab,
  });
}

export function readWorkspaceRouteState(
  pathname: string,
  products: ProductWorkspace[],
): WorkspaceRouteState {
  return normalizeWorkspaceRouteState({
    ...parseWorkspacePath(pathname),
    products,
  });
}

export function createWorkspacePath(state: WorkspaceRouteState) {
  if (state.tab === "products") {
    return "/products";
  }

  if (state.tab === "connect") {
    return "/connections";
  }

  if (!state.productId || !isProductRouteTab(state.tab)) {
    return "/products";
  }

  return `/products/${encodeURIComponent(state.productId)}/${tabToSegment[state.tab]}`;
}

export function normalizeWorkspaceRouteState({
  productId,
  products,
  tab,
}: {
  productId: string | null;
  products: ProductWorkspace[];
  tab: Tab;
}): WorkspaceRouteState {
  const activeProductId = products.some((product) => product.id === productId)
    ? productId
    : null;

  if (tab === "products") {
    return {
      productId: null,
      tab,
    };
  }

  if (isProductRouteTab(tab) && !activeProductId) {
    return {
      productId: null,
      tab: "products",
    };
  }

  return {
    productId: activeProductId,
    tab,
  };
}

function parseWorkspacePath(pathname: string): Pick<WorkspaceRouteState, "productId" | "tab"> {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "connections") {
    return {
      productId: null,
      tab: "connect",
    };
  }

  if (segments[0] !== "products") {
    return {
      productId: null,
      tab: "products",
    };
  }

  if (!segments[1]) {
    return {
      productId: null,
      tab: "products",
    };
  }

  return {
    productId: decodeURIComponent(segments[1]),
    tab: segmentToTab[segments[2] || "chat"] ?? "chat",
  };
}

function parseTab(value?: string | null): Tab | null {
  return validTabs.includes(value as Tab) ? (value as Tab) : null;
}

function isProductRouteTab(tab: Tab): tab is ProductRouteTab {
  return productTabs.has(tab as ProductRouteTab);
}
