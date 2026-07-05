"use client";

import { useEffect, useRef, useState } from "react";

type ProductActionsMenuProps = {
  isActive?: boolean;
  onDelete: () => void;
  onRename: () => void;
};

export function ProductActionsMenu({
  isActive = false,
  onDelete,
  onRename,
}: ProductActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeMenuWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeMenuWithEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeMenuWithEscape);
    };
  }, [isOpen]);

  function deleteProduct() {
    setIsOpen(false);
    onDelete();
  }

  function startRename() {
    setIsOpen(false);
    onRename();
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Product actions"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-8 w-8 items-center justify-center rounded-md border text-lg font-semibold leading-none transition ${
          isActive
            ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        ...
      </button>
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-32 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
          <button
            type="button"
            onClick={startRename}
            className="flex min-h-9 w-full items-center rounded-md px-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={deleteProduct}
            className="flex min-h-9 w-full items-center rounded-md px-3 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
