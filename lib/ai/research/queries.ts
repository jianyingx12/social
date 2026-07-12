import type { ProductWorkspace } from "@/lib/types";

const maxQueries = 6;

export function hasEnoughResearchContext(product: ProductWorkspace) {
  return Boolean(
    product.oneLine.trim() ||
      product.problem.trim() ||
      product.audience.trim() ||
      product.keywords.trim(),
  );
}

export function buildResearchQueries(product: ProductWorkspace) {
  const targetQueries = product.researchTargets.flatMap((target) => [
    target.query,
    target.signal,
  ]);
  const primaryPain = product.problem || product.oneLine;
  const primaryKeyword = splitQueryParts(product.keywords)[0] || product.oneLine || product.name;
  const audience = product.audience;
  const rawQueries = [
    product.problem,
    product.oneLine,
    product.keywords,
    product.audience,
    ...targetQueries,
    primaryPain ? `${primaryPain} alternative` : "",
    primaryPain ? `${primaryPain} workaround` : "",
    primaryKeyword ? `${primaryKeyword} tool` : "",
    audience && primaryPain ? `${audience} ${primaryPain}` : "",
    audience && primaryKeyword ? `${audience} recommend ${primaryKeyword}` : "",
  ];

  return Array.from(
    new Set(
      rawQueries
        .flatMap(splitQueryParts)
        .map((query) => query.trim())
        .filter((query) => query.length >= 3),
    ),
  ).slice(0, maxQueries);
}

function splitQueryParts(value: string) {
  return value.split(/[,;\n]/);
}
