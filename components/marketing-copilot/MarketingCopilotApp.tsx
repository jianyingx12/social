"use client";

import { AccountPanel } from "./AccountPanel";
import { ApprovalsPanel } from "./ApprovalsPanel";
import { BriefPanel } from "./BriefPanel";
import { ConnectionNoticeBanner } from "./ConnectionNoticeBanner";
import { Metric } from "./Metric";
import { OpportunitiesPanel } from "./OpportunitiesPanel";
import { ProductDirectoryPanel } from "./ProductDirectoryPanel";
import { RepurposePanel } from "./RepurposePanel";
import { Sidebar } from "./Sidebar";
import { useMarketingCopilot } from "./useMarketingCopilot";

export function MarketingCopilotApp() {
  const {
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
    disconnectConnectedAccount,
    draftOpportunity,
    generatePlan,
    generateTikTokPlan,
    createProduct,
    deleteProduct,
    removeProductResource,
    renameProduct,
    scheduleDraft,
    selectProduct,
    sendTikTokIdeaToReview,
    setActiveTab,
    updateActiveProduct,
  } = useMarketingCopilot();

  return (
    <main className="min-h-screen bg-[#f5f7f9] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-end lg:p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                AI growth agent
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                OrganicReach
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Find conversations your product should be part of, draft useful responses, and keep
                every public action in review.
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">
                Active product: {activeProduct.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <Metric label="Opportunities" value={String(opportunityCount)} />
              <Metric label="Review" value={String(pendingCount)} />
              <Metric label="Connected" value={`${connectedCount}/3`} />
              <Metric label="Resources" value={String(resourceCount)} />
            </div>
          </div>
          <div className="border-t border-slate-200 bg-slate-950 px-5 py-3 text-sm text-slate-100 lg:px-6">
            Review-first workflow: discover demand, draft a useful response, approve before posting.
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[248px_1fr]">
          <Sidebar
            activeTab={activeTab}
            activeProductId={activeProductId}
            products={products}
            onCreateProduct={createProduct}
            onDeleteProduct={deleteProduct}
            onOpenProducts={() => setActiveTab("products")}
            onRenameProduct={renameProduct}
            onSelectProduct={selectProduct}
            onTabChange={setActiveTab}
          />

          <div className="min-w-0">
            {connectionNotice && <ConnectionNoticeBanner notice={connectionNotice} />}
            {activeTab === "opportunities" && (
              <OpportunitiesPanel
                opportunities={opportunities}
                onDraft={draftOpportunity}
                onOpenBrief={() => setActiveTab("brief")}
              />
            )}
            {activeTab === "brief" && (
              <BriefPanel
                product={activeProduct}
                onAddResource={addProductResource}
                onGenerate={generatePlan}
                onProductChange={updateActiveProduct}
                onRemoveResource={removeProductResource}
              />
            )}
            {activeTab === "review" && (
              <ApprovalsPanel drafts={drafts} onApprove={approveDraft} onSchedule={scheduleDraft} />
            )}
            {activeTab === "repurpose" && (
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
