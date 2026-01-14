"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface UseKeyboardShortcutsOptions {
  onSync?: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

export function useKeyboardShortcuts({ onSync, searchInputRef }: UseKeyboardShortcutsOptions) {
  const { theme, setTheme } = useTheme();
  const lastKeyRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow "/" to blur and focus search
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      const now = Date.now();

      // "/" - Focus search
      if (e.key === "/") {
        e.preventDefault();
        searchInputRef?.current?.focus();
        return;
      }

      // "r" - Sync
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        onSync?.();
        return;
      }

      // "t" - Toggle theme
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        setTheme(theme === "dark" ? "light" : "dark");
        return;
      }

      // "g g" - Go to top (vim-like)
      if (e.key === "g") {
        if (lastKeyRef.current === "g" && now - lastKeyTimeRef.current < 500) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          lastKeyRef.current = "";
          return;
        }
        lastKeyRef.current = "g";
        lastKeyTimeRef.current = now;
        return;
      }

      // "G" - Go to bottom
      if (e.key === "G") {
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        return;
      }

      lastKeyRef.current = "";
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSync, searchInputRef, theme, setTheme]);
}
