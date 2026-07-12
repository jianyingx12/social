"use client";

import { useEffect } from "react";
import type { ConnectionNotice } from "./connection-notices";

type ConnectionNoticeToastProps = {
  notice: ConnectionNotice;
  onDismiss: () => void;
};

export function ConnectionNoticeToast({ notice, onDismiss }: ConnectionNoticeToastProps) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-emerald-950/10",
    warning: "border-amber-200 bg-amber-50 text-amber-950 shadow-amber-950/10",
    error: "border-rose-200 bg-rose-50 text-rose-950 shadow-rose-950/10",
  };
  const dismissDelay = notice.tone === "success" ? 4500 : 8000;

  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, dismissDelay);

    return () => window.clearTimeout(timeoutId);
  }, [dismissDelay, onDismiss, notice.message]);

  return (
    <div className="fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:top-6">
      <div
        className={`rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${styles[notice.tone]}`}
        role={notice.tone === "error" ? "alert" : "status"}
      >
        <div className="flex items-start gap-3">
          <p className="min-w-0 flex-1 leading-6">{notice.message}</p>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold opacity-70 transition hover:bg-white/70 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
