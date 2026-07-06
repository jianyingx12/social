"use client";

import { ChatPanel } from "./chat/ChatPanel";
import { AccountPanel } from "../connections/AccountPanel";
import { ConnectionNoticeBanner } from "../connections/ConnectionNoticeBanner";
import { useMarketingCopilot } from "./hooks/useMarketingCopilot";
import { AppHeader } from "../layout/AppHeader";
import { Sidebar } from "../layout/Sidebar";
import { BriefPanel } from "./product-brief/BriefPanel";
import { ProductDirectoryPanel } from "./products/ProductDirectoryPanel";
import { ResearchPanel } from "./research/ResearchPanel";
import { RepurposePanel } from "./repurpose/RepurposePanel";
import { ResourcesPanel } from "./resources/ResourcesPanel";
import { ApprovalsPanel } from "./review/ApprovalsPanel";

export function MarketingCopilotApp() {
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
    tiktokIdeas,
    addResearchTarget,
    addProductResource,
    approveDraft,
    connectAccount,
    disconnectConnectedAccount,
    draftOpportunity,
    generatePlan,
    generateResearchTargets,
    generateTikTokPlan,
    createProduct,
    deleteProduct,
    deselectProduct,
    removeProductResource,
    removeResearchTarget,
    renameProduct,
    scheduleDraft,
    selectProduct,
    sendTikTokIdeaToReview,
    setActiveTab,
    updateChatMessages,
    updateActiveProduct,
  } = useMarketingCopilot();

  return (
    <main className="min-h-screen bg-[#f5f7f9] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <AppHeader activeProduct={activeProduct} />

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
                researchTargets={researchTargets}
                onAddTarget={addResearchTarget}
                onDraft={draftOpportunity}
                onGenerateTargets={generateResearchTargets}
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
              <ApprovalsPanel drafts={drafts} onApprove={approveDraft} onSchedule={scheduleDraft} />
            )}
            {activeTab === "repurpose" && activeProduct && (
              <RepurposePanel
                accounts={accounts}
                drafts={drafts}
                ideas={tiktokIdeas}
                onGenerateTikTokPlan={generateTikTokPlan}
                onSendTikTokIdeaToReview={sendTikTokIdeaToReview}
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
