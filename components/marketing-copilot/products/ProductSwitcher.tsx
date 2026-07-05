"use client";

import { useState } from "react";
import { InlineProductName } from "./InlineProductName";
import { ProductActionsMenu } from "./ProductActionsMenu";
import type { ProductWorkspace } from "@/lib/types";

const visibleProductLimit = 3;

type ProductSwitcherProps = {
  activeProductId: string | null;
  products: ProductWorkspace[];
  onCreateProduct: () => void;
  onDeleteProduct: (id: string) => void;
  onDeselectProduct: () => void;
  onOpenProducts: () => void;
  onRenameProduct: (id: string, name: string) => void;
  onSelectProduct: (id: string) => void;
};

export function ProductSwitcher({
  activeProductId,
  products,
  onCreateProduct,
  onDeleteProduct,
  onDeselectProduct,
  onOpenProducts,
  onRenameProduct,
  onSelectProduct,
}: ProductSwitcherProps) {
  const [renamingProductId, setRenamingProductId] = useState<string | null>(null);
  const [renamingProductName, setRenamingProductName] = useState("");
  const visibleProducts = products.slice(0, visibleProductLimit);
  const hiddenProductCount = Math.max(products.length - visibleProducts.length, 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Products
        </p>
        <button
          onClick={onCreateProduct}
          className="flex min-h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
        >
          New
        </button>
      </div>
      <div className="mt-3 grid gap-2">
        {visibleProducts.map((product) => {
          const isActive = product.id === activeProductId;

          return (
            <div
              key={product.id}
              className={`rounded-md border p-2 transition ${
                isActive
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-800 hover:border-teal-300 hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <InlineProductName
                    className="block w-full truncate text-left text-sm font-semibold"
                    isEditing={renamingProductId === product.id}
                    name={renamingProductId === product.id ? renamingProductName : product.name}
                    onCancel={() => setRenamingProductId(null)}
                    onCommit={(name) => {
                      onRenameProduct(product.id, name);
                      setRenamingProductId(null);
                    }}
                    onNameChange={setRenamingProductName}
                    onOpen={() => {
                      if (isActive) {
                        onDeselectProduct();
                        return;
                      }

                      onSelectProduct(product.id);
                    }}
                  />
                  <span
                    className={`mt-1 block text-xs leading-5 ${
                      isActive ? "text-slate-200" : "text-slate-500"
                    }`}
                  >
                    {product.productType} - {product.resources.length} resource
                    {product.resources.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ProductActionsMenu
                  isActive={isActive}
                  onDelete={() => onDeleteProduct(product.id)}
                  onRename={() => {
                    setRenamingProductId(product.id);
                    setRenamingProductName(product.name);
                  }}
                />
              </div>
            </div>
          );
        })}
        {hiddenProductCount > 0 && (
          <button
            type="button"
            onClick={onOpenProducts}
            className="flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          >
            See more ({hiddenProductCount})
          </button>
        )}
      </div>
    </div>
  );
}
