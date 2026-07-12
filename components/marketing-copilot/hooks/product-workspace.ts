import type { ProductWorkspace } from "@/lib/types";

export function createBlankProduct(name: string): ProductWorkspace {
  return {
    id: `product-${Date.now()}`,
    name,
    productType: "Other",
    productUrl: "",
    oneLine: "",
    audience: "",
    problem: "",
    outcome: "",
    differentiator: "",
    proof: "",
    voice: "",
    channels: "",
    keywords: "",
    avoid: "",
    brief: "",
    resources: [],
    researchTargets: [],
    chatMessages: [],
    drafts: [],
    opportunities: [],
    contentIdeas: [],
  };
}

export function getActiveProduct(
  products: ProductWorkspace[],
  activeProductId: string | null,
) {
  return products.find((product) => product.id === activeProductId) ?? null;
}

export function getProductContext(product: ProductWorkspace) {
  return [
    `Product type: ${product.productType}`,
    product.oneLine ? `One-line description: ${product.oneLine}` : "",
    product.productUrl ? `Link: ${product.productUrl}` : "",
    product.audience ? `Audience: ${product.audience}` : "",
    product.problem ? `Problem/desire: ${product.problem}` : "",
    product.outcome ? `Outcome promised: ${product.outcome}` : "",
    product.differentiator ? `Differentiator: ${product.differentiator}` : "",
    product.proof ? `Proof: ${product.proof}` : "",
    product.voice ? `Voice: ${product.voice}` : "",
    product.channels ? `Channels: ${product.channels}` : "",
    product.keywords ? `Keywords: ${product.keywords}` : "",
    product.avoid ? `Avoid/rules: ${product.avoid}` : "",
    product.brief ? `Extra notes: ${product.brief}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
