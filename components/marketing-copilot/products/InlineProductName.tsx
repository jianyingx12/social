"use client";

import { useEffect, useRef } from "react";

type InlineProductNameProps = {
  className: string;
  inputClassName?: string;
  isEditing: boolean;
  name: string;
  onCancel: () => void;
  onCommit: (name: string) => void;
  onNameChange: (name: string) => void;
  onOpen: () => void;
};

export function InlineProductName({
  className,
  inputClassName,
  isEditing,
  name,
  onCancel,
  onCommit,
  onNameChange,
  onOpen,
}: InlineProductNameProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wasEditingRef = useRef(false);

  useEffect(() => {
    if (isEditing && !wasEditingRef.current) {
      const frameId = window.requestAnimationFrame(() => inputRef.current?.select());
      wasEditingRef.current = isEditing;

      return () => window.cancelAnimationFrame(frameId);
    }

    wasEditingRef.current = isEditing;
  }, [isEditing, name]);

  function commitName() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      onCancel();
      return;
    }

    onCommit(trimmedName);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={name}
        onBlur={commitName}
        onChange={(event) => onNameChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commitName();
          }

          if (event.key === "Escape") {
            onCancel();
          }
        }}
        className={
          inputClassName ??
          "min-h-8 w-full rounded-md border border-teal-500 bg-white px-2 text-sm font-semibold text-slate-950 outline-none ring-2 ring-teal-100"
        }
      />
    );
  }

  return (
    <button type="button" onClick={onOpen} className={className}>
      {name}
    </button>
  );
}
