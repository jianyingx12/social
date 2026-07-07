import { MarketingCopilotApp } from "@/components/marketing-copilot/MarketingCopilotApp";
import { auth } from "@/lib/auth/server";
import { getUserStorageKey, toAppUser } from "@/lib/auth/session-user";
import { loadProductWorkspaces } from "@/lib/db/product-workspaces";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: session } = await auth.getSession();
  const currentUser = toAppUser(session?.user ?? null);
  const userId = getUserStorageKey(session?.user ?? null);
  const productWorkspaces = userId ? await loadProductWorkspaces(userId) : [];

  return (
    <MarketingCopilotApp
      currentUser={currentUser}
      initialProductWorkspaces={productWorkspaces}
    />
  );
}
