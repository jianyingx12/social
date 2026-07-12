import type { Draft, DraftOutcome, Opportunity } from "@/lib/types";

export type DraftOutcomeUpdates = Partial<Pick<Draft, "postedUrl" | "outcomeNotes">> & {
  outcome?: DraftOutcome | "";
};

export function approveDrafts(drafts: Draft[], id: number) {
  const approvedAt = new Date().toISOString();

  return drafts.map((draft) =>
    draft.id === id
      ? {
          ...draft,
          status: "Approved" as const,
          approvedAt,
          scheduledAt: undefined,
          time: "Approved. Choose a schedule time.",
        }
      : draft,
  );
}

export function scheduleDrafts(drafts: Draft[], id: number, scheduledFor: string) {
  const trimmedScheduledFor = scheduledFor.trim();

  if (!trimmedScheduledFor) {
    return drafts;
  }

  return drafts.map((draft) =>
    draft.id === id
      ? {
          ...draft,
          status: "Scheduled" as const,
          scheduledAt: new Date().toISOString(),
          scheduledFor: trimmedScheduledFor,
          time: `Scheduled for ${formatScheduleTime(trimmedScheduledFor)}`,
        }
      : draft,
  );
}

export function markDraftPostedInDrafts(drafts: Draft[], id: number) {
  const postedAt = new Date().toISOString();

  return drafts.map((draft) =>
    draft.id === id
      ? {
          ...draft,
          status: "Posted" as const,
          postedAt,
          outcome: draft.outcome ?? "No response yet",
          time: "Posted. Track the result when you know it.",
        }
      : draft,
  );
}

export function updateDraftOutcomeInDrafts(
  drafts: Draft[],
  id: number,
  updates: DraftOutcomeUpdates,
) {
  return drafts.map((draft) => {
    if (draft.id !== id) {
      return draft;
    }

    return {
      ...draft,
      ...updates,
      outcome: updates.outcome === "" ? undefined : updates.outcome,
    };
  });
}

export function updateDraftCopyInDrafts(
  drafts: Draft[],
  id: number,
  updates: Partial<Pick<Draft, "title" | "body" | "scheduledFor">>,
) {
  return drafts.map((draft) => {
    if (draft.id !== id) {
      return draft;
    }

    const copyChanged =
      (typeof updates.title === "string" && updates.title !== draft.title) ||
      (typeof updates.body === "string" && updates.body !== draft.body);

    if (!copyChanged) {
      return { ...draft, ...updates };
    }

    return {
      ...draft,
      ...updates,
      status: "Draft" as const,
      approvedAt: undefined,
      scheduledAt: undefined,
      scheduledFor: undefined,
      postedAt: undefined,
      postedUrl: undefined,
      outcome: undefined,
      outcomeNotes: undefined,
      time: "Edited. Needs review.",
    };
  });
}

export function createDraftFromOpportunity(opportunity: Opportunity): Draft {
  return {
    id: Date.now(),
    platform: opportunity.platform,
    format: "Reply",
    status: "Draft",
    title: `Draft from: ${opportunity.title}`,
    body: [
      opportunity.suggestedReply,
      "",
      `Source: ${opportunity.source}`,
      opportunity.actionType ? `Organic action: ${opportunity.actionType}` : "",
      opportunity.recommendedAction ? `Recommended action: ${opportunity.recommendedAction}` : "",
      opportunity.replyStrategy ? `Organic posture: ${opportunity.replyStrategy}` : "",
      opportunity.followUp ? `Follow-up: ${opportunity.followUp}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    time: "Ready for review",
  };
}

function formatScheduleTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
