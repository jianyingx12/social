import { auth } from "@/lib/auth/server";
import { getUserStorageKey, toAppUser } from "@/lib/auth/session-user";
import { loadProductWorkspaces } from "@/lib/db/product-workspaces";
import type { Tab } from "@/lib/types";

import { MarketingCopilotApp } from "./MarketingCopilotApp";

type WorkspaceRoutePageProps = {
  productId?: string;
  tab: Tab;
};

export async function WorkspaceRoutePage({ productId, tab }: WorkspaceRoutePageProps) {
  const { data: session } = await auth.getSession();
  const currentUser = toAppUser(session?.user ?? null);
  const userId = getUserStorageKey(session?.user ?? null);
  const productWorkspaces = userId ? await loadProductWorkspaces(userId) : [];

  return (
    <MarketingCopilotApp
      key={`${productId ?? "workspace"}:${tab}`}
      currentUser={currentUser}
      initialProductId={productId}
      initialProductWorkspaces={productWorkspaces}
      initialTab={tab}
    />
  );
}
