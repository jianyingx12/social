import type { Draft, DraftOutcome } from "@/lib/types";

export const draftOutcomeOptions: DraftOutcome[] = [
  "No response yet",
  "Got engagement",
  "Got reply",
  "Got lead",
  "Converted",
  "Bad fit",
  "Skipped",
];

export function getStatusClassName(status: Draft["status"]) {
  if (status === "Posted") {
    return "bg-sky-100 text-sky-800";
  }

  if (status === "Scheduled") {
    return "bg-indigo-100 text-indigo-800";
  }

  if (status === "Approved") {
    return "bg-emerald-100 text-emerald-800";
  }

  return "bg-amber-100 text-amber-800";
}

export function getApproveButtonLabel(status: Draft["status"]) {
  if (status === "Posted") {
    return "Posted";
  }

  if (status === "Scheduled") {
    return "Scheduled";
  }

  if (status === "Approved") {
    return "Approved";
  }

  return "Approve draft";
}

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
