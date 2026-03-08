"use client";

import { useState } from "react";

const STORAGE_KEY = "sidebar-collapsed";

function getInitialState(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "true";
}

export function useSidebarCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(getInitialState);

  const toggle = () => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, String(newValue));
      }
      return newValue;
    });
  };

  const collapse = () => {
    setIsCollapsed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
  };

  const expand = () => {
    setIsCollapsed(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "false");
    }
  };

  return { isCollapsed, toggle, collapse, expand };
}
