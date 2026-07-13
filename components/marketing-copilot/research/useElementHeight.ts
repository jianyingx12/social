"use client";

import { useEffect, useState } from "react";

export function useElementHeight(element: HTMLElement | null) {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!element) {
      return;
    }

    const observedElement = element;

    function updateHeight() {
      setHeight(observedElement.getBoundingClientRect().height);
    }

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(observedElement);

    return () => observer.disconnect();
  }, [element]);

  return height;
}
