import type { Tab } from "@/lib/types";
import { globalTabs, productTabs } from "@/lib/marketing-data";
import type { ProductWorkspace } from "@/lib/types";
import { ProductSwitcher } from "../marketing-copilot/products/ProductSwitcher";

type SidebarProps = {
  activeTab: Tab;
  activeProductId: string | null;
  products: ProductWorkspace[];
  onCreateProduct: () => void;
  onDeleteProduct: (id: string) => void;
  onDeselectProduct: () => void;
  onOpenProducts: () => void;
  onRenameProduct: (id: string, name: string) => void;
  onSelectProduct: (id: string) => void;
  onTabChange: (tab: Tab) => void;
};

export function Sidebar({
  activeTab,
  activeProductId,
  products,
  onCreateProduct,
  onDeleteProduct,
  onDeselectProduct,
  onOpenProducts,
  onRenameProduct,
  onSelectProduct,
  onTabChange,
}: SidebarProps) {
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-5 lg:self-start">
      <ProductSwitcher
        activeProductId={activeProductId}
        products={products}
        onCreateProduct={onCreateProduct}
        onDeleteProduct={onDeleteProduct}
        onDeselectProduct={onDeselectProduct}
        onOpenProducts={onOpenProducts}
        onRenameProduct={onRenameProduct}
        onSelectProduct={onSelectProduct}
      />

      {activeProductId && (
        <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Product workspace
          </p>
          {productTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-medium leading-tight transition ${
                activeTab === tab.id
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {tab.label}
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${
                  activeTab === tab.id ? "bg-teal-300" : "bg-transparent"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Workspace
        </p>
        {globalTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-medium leading-tight transition ${
              activeTab === tab.id
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            {tab.label}
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${
                activeTab === tab.id ? "bg-teal-300" : "bg-transparent"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">
          Agent rule
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Find demand first. Draft helpful replies second. Ask before anything goes public.
        </p>
      </div>
    </aside>
  );
}
