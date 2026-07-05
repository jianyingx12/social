import type { ProductBriefUpdates, ProductWorkspace } from "@/lib/types";

export function isStepComplete(product: ProductWorkspace, fields: (keyof ProductBriefUpdates)[]) {
  return fields.some((field) => {
    const value = product[field];

    return typeof value === "string" && value.trim().length > 0 && value !== "Other";
  });
}

export function getCompletionCount(product: ProductWorkspace) {
  return [
    product.productType === "Other" ? "" : product.productType,
    product.productUrl,
    product.oneLine,
    product.audience,
    product.problem,
    product.outcome,
    product.differentiator,
    product.proof,
    product.voice,
    product.channels,
    product.keywords,
    product.avoid,
  ].filter((value) => value.trim()).length;
}
