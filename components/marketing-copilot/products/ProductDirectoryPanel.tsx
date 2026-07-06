"use client";

import { useState } from "react";
import { InlineProductName } from "./InlineProductName";
import type { ProductWorkspace } from "@/lib/types";
import { ProductActionsMenu } from "./ProductActionsMenu";

type ProductDirectoryPanelProps = {
  activeProductId: string | null;
  products: ProductWorkspace[];
  onCreateProduct: () => void;
  onDeleteProduct: (id: string) => void;
  onDeselectProduct: () => void;
  onRenameProduct: (id: string, name: string) => void;
  onSelectProduct: (id: string) => void;
};

export function ProductDirectoryPanel({
  activeProductId,
  products,
  onCreateProduct,
  onDeleteProduct,
  onDeselectProduct,
  onRenameProduct,
  onSelectProduct,
}: ProductDirectoryPanelProps) {
  const [renamingProductId, setRenamingProductId] = useState<string | null>(null);
  const [renamingProductName, setRenamingProductName] = useState("");

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Products</h2>
          <p className="mt-1 text-sm text-slate-600">
            Each product keeps its own brief, audience, source material, and generated work.
          </p>
        </div>
        {products.length > 0 && (
          <button
            type="button"
            onClick={onCreateProduct}
            className="flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-teal-700"
          >
            Add product
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-950">No products yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Add a product to start building its brief, research plan, source material, and drafts.
          </p>
          <button
            type="button"
            onClick={onCreateProduct}
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-teal-700"
          >
            Add product
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
          const isActive = product.id === activeProductId;

          return (
            <article
              key={product.id}
              className={`rounded-lg border p-4 ${
                isActive ? "border-slate-950 bg-slate-50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <InlineProductName
                    className="block w-full truncate text-left text-lg font-semibold text-slate-950"
                    inputClassName="min-h-10 w-full rounded-md border border-teal-500 bg-white px-2 text-lg font-semibold text-slate-950 outline-none ring-2 ring-teal-100"
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
                  <span className="mt-1 block text-sm text-slate-600">
                    {product.resources.length} draft source
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
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                {product.oneLine || product.brief || "No product brief yet."}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (isActive) {
                    onDeselectProduct();
                    return;
                  }

                  onSelectProduct(product.id);
                }}
                className="mt-4 flex min-h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                {isActive ? "Close context" : "Open context"}
              </button>
            </article>
          );
          })}
        </div>
      )}
    </section>
  );
}
