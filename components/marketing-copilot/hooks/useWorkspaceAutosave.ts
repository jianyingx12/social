"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductWorkspace } from "@/lib/types";

export type WorkspaceSaveStatus = "disabled" | "idle" | "saving" | "saved" | "error";

type UseWorkspaceAutosaveParams = {
  enablePersistence: boolean;
  products: ProductWorkspace[];
};

export function useWorkspaceAutosave({
  enablePersistence,
  products,
}: UseWorkspaceAutosaveParams) {
  const [workspaceSaveStatus, setWorkspaceSaveStatus] = useState<WorkspaceSaveStatus>(
    enablePersistence ? "saved" : "disabled",
  );
  const hasMountedPersistence = useRef(false);
  const saveVersion = useRef(0);

  useEffect(() => {
    if (!enablePersistence) {
      return;
    }

    if (!hasMountedPersistence.current) {
      hasMountedPersistence.current = true;
      return;
    }

    const currentSaveVersion = saveVersion.current + 1;
    saveVersion.current = currentSaveVersion;

    const timeoutId = window.setTimeout(() => {
      setWorkspaceSaveStatus("saving");

      fetch("/api/workspaces", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Could not save workspace.");
          }

          if (saveVersion.current === currentSaveVersion) {
            setWorkspaceSaveStatus("saved");
          }
        })
        .catch(() => {
          if (saveVersion.current === currentSaveVersion) {
            setWorkspaceSaveStatus("error");
          }
        });
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [enablePersistence, products]);

  return workspaceSaveStatus;
}
