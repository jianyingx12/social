"use client";

import { useState } from "react";

import { ChatPanel } from "./chat/ChatPanel";
import { AccountPanel } from "../connections/AccountPanel";
import { ConnectionNoticeBanner } from "../connections/ConnectionNoticeBanner";
import { useMarketingCopilot } from "./hooks/useMarketingCopilot";
import { AppHeader } from "../layout/AppHeader";
import { Sidebar } from "../layout/Sidebar";
import { BriefPanel } from "./product-brief/BriefPanel";
import { ProductDirectoryPanel } from "./products/ProductDirectoryPanel";
import { ResearchPanel } from "./research/ResearchPanel";
import { IdeasPanel } from "./ideas/IdeasPanel";
import { ResourcesPanel } from "./resources/ResourcesPanel";
import { ApprovalsPanel } from "./review/ApprovalsPanel";
import type { AppUser } from "@/lib/auth/session-user";
import type { ProductWorkspace } from "@/lib/types";

type MarketingCopilotAppProps = {
  currentUser: AppUser | null;
  initialProductWorkspaces: ProductWorkspace[];
};

export function MarketingCopilotApp({
  currentUser,
  initialProductWorkspaces,
}: MarketingCopilotAppProps) {
  const [briefAssistRequest, setBriefAssistRequest] = useState<{
    id: number;
    missingFields: string[];
  } | null>(null);
  const {
    accounts,
    activeTab,
    activeProduct,
    activeProductId,
    connectionNotice,
    drafts,
    opportunities,
    products,
    researchTargets,
    contentIdeaError,
    contentIdeas,
    contentIdeaReadiness,
    researchError,
    isGeneratingContentIdeas,
    isGeneratingResearch,
    addResearchTarget,
    addProductResource,
    approveDraft,
    connectAccount,
    disconnectConnectedAccount,
    draftOpportunity,
    generatePlan,
    generateContentPlan,
    generateResearchTargets,
    runHackerNewsResearch,
    createProduct,
    deleteProduct,
    deselectProduct,
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
  } = useMarketingCopilot({
    enablePersistence: Boolean(currentUser),
    initialProductWorkspaces,
  });

  return (
    <main className="min-h-screen bg-[#f5f7f9] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <AppHeader activeProduct={activeProduct} currentUser={currentUser} />

        <section className="grid gap-4 lg:grid-cols-[248px_1fr]">
          <Sidebar
            activeTab={activeTab}
            activeProductId={activeProductId}
            products={products}
            onCreateProduct={createProduct}
            onDeleteProduct={deleteProduct}
            onDeselectProduct={deselectProduct}
            onOpenProducts={() => setActiveTab("products")}
            onRenameProduct={renameProduct}
            onSelectProduct={selectProduct}
            onTabChange={setActiveTab}
          />

          <div className="min-w-0">
            {connectionNotice && <ConnectionNoticeBanner notice={connectionNotice} />}
            {activeTab === "chat" && activeProduct && (
              <ChatPanel
                accounts={accounts}
                briefAssistRequest={briefAssistRequest}
                drafts={drafts}
                messages={activeProduct.chatMessages}
                opportunities={opportunities}
                product={activeProduct}
                onMessagesChange={updateChatMessages}
                onOpenBrief={() => setActiveTab("brief")}
                onProductChange={updateActiveProduct}
              />
            )}
            {activeTab === "opportunities" && activeProduct && (
              <ResearchPanel
                opportunities={opportunities}
                product={activeProduct}
                researchError={researchError}
                researchTargets={researchTargets}
                isGeneratingResearch={isGeneratingResearch}
                onAddTarget={addResearchTarget}
                onDraft={draftOpportunity}
                onGenerateTargets={generateResearchTargets}
                onRunResearch={runHackerNewsResearch}
                onOpenBrief={() => setActiveTab("brief")}
                onRemoveTarget={removeResearchTarget}
              />
            )}
            {activeTab === "brief" && activeProduct && (
              <BriefPanel
                product={activeProduct}
                onGenerate={generatePlan}
                onProductChange={updateActiveProduct}
              />
            )}
            {activeTab === "resources" && activeProduct && (
              <ResourcesPanel
                resources={activeProduct.resources}
                onAddResource={addProductResource}
                onRemoveResource={removeProductResource}
              />
            )}
            {activeTab === "review" && activeProduct && (
              <ApprovalsPanel
                drafts={drafts}
                onApprove={approveDraft}
                onDraftChange={updateDraft}
                onSchedule={scheduleDraft}
              />
            )}
            {activeTab === "ideas" && activeProduct && (
              <IdeasPanel
                accounts={accounts}
                drafts={drafts}
                error={contentIdeaError}
                ideas={contentIdeas}
                isGenerating={isGeneratingContentIdeas}
                readiness={contentIdeaReadiness}
                onGenerateIdeas={generateContentPlan}
                onOpenBrief={() => setActiveTab("brief")}
                onOpenChat={() => {
                  setBriefAssistRequest({
                    id: Date.now(),
                    missingFields: contentIdeaReadiness.missingFields,
                  });
                  setActiveTab("chat");
                }}
                onSendIdeaToReview={sendContentIdeaToReview}
              />
            )}
            {activeTab === "products" && (
              <ProductDirectoryPanel
                activeProductId={activeProductId}
                products={products}
                onCreateProduct={createProduct}
                onDeleteProduct={deleteProduct}
                onDeselectProduct={deselectProduct}
                onRenameProduct={renameProduct}
                onSelectProduct={selectProduct}
              />
            )}
            {activeTab === "connect" && (
              <AccountPanel
                accounts={accounts}
                onConnect={connectAccount}
                onDisconnect={disconnectConnectedAccount}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
