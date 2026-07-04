import type { Draft, TikTokIdea } from "@/lib/types";

export function generateTikTokIdeas({
  approvedDrafts,
  brief,
}: {
  approvedDrafts: Draft[];
  brief: string;
}): TikTokIdea[] {
  const sourceDrafts = approvedDrafts.length > 0 ? approvedDrafts : [createFallbackDraft(brief)];

  return sourceDrafts.slice(0, 3).map((draft, index) => {
    const corePoint = summarizeSource(draft.body);
    const product = getProductName(brief);

    return {
      id: Date.now() + index,
      sourceTitle: draft.title,
      hook: getHook(corePoint, product, index),
      script: [
        getHook(corePoint, product, index),
        `Show the problem in one concrete example: ${corePoint}`,
        `Then show how ${product} approaches it without turning the moment into a hard sell.`,
        "End by asking viewers where they are already seeing this problem show up.",
      ].join("\n"),
      caption: `${product} note: start with real conversations before making content. #foundermarketing #startupgrowth`,
      callToAction: "Comment with the channel or community where this problem shows up most.",
      angle:
        draft.platform === "Reddit"
          ? "Turn a useful community reply into a short educational clip."
          : "Turn a proven answer into a short-form teaching moment.",
    };
  });
}

export function createDraftFromTikTokIdea(idea: TikTokIdea): Draft {
  return {
    id: Date.now(),
    platform: "TikTok",
    format: "Short-form idea",
    status: "Draft",
    title: idea.hook,
    body: [
      `Script:\n${idea.script}`,
      `Caption:\n${idea.caption}`,
      `CTA:\n${idea.callToAction}`,
    ].join("\n\n"),
    time: "Ready for review",
  };
}

function createFallbackDraft(brief: string): Draft {
  return {
    id: 0,
    platform: "TikTok",
    format: "Short-form idea",
    status: "Approved",
    title: "Product brief angle",
    body:
      brief.trim() ||
      "The product helps founders find real conversations before writing public-facing content.",
    time: "Generated from product brief",
  };
}

function getProductName(brief: string) {
  const firstPhrase = brief.split(/[.!?\n]/)[0]?.trim();
  const firstWord = firstPhrase?.split(/\s+/)[0];

  return firstWord && firstWord.length > 2 ? firstWord : "the product";
}

function summarizeSource(source: string) {
  return source
    .replace(/\s+/g, " ")
    .split(/[.!?]/)[0]
    .trim()
    .slice(0, 180);
}

function getHook(corePoint: string, product: string, index: number) {
  const hooks = [
    `Stop making content before you know what people are already asking.`,
    `A better ${product} growth signal is hiding in plain sight.`,
    `This is how I would turn one useful reply into a TikTok idea.`,
  ];

  return hooks[index] ?? `Here is the short version: ${corePoint}`;
}
