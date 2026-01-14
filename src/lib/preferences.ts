"use client";

export interface UserPreferences {
  defaultSort: "starredAt" | "stargazersCount" | "pushedAt" | "name";
  itemsPerPage: number;
  compactView: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultSort: "starredAt",
  itemsPerPage: 50,
  compactView: false,
};

const STORAGE_KEY = "starflow-preferences";

export function getPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load preferences:", e);
  }

  return DEFAULT_PREFERENCES;
}

export function setPreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === "undefined") return;

  try {
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event for other components to react
    window.dispatchEvent(new CustomEvent("preferences-changed", { detail: updated }));
  } catch (e) {
    console.error("Failed to save preferences:", e);
  }
}

export function usePreferencesListener(callback: (prefs: UserPreferences) => void) {
  if (typeof window === "undefined") return;

  const handler = (e: CustomEvent<UserPreferences>) => {
    callback(e.detail);
  };

  window.addEventListener("preferences-changed", handler as EventListener);
  return () => window.removeEventListener("preferences-changed", handler as EventListener);
}
