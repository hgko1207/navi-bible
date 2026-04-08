"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AppSettings, ThemeMode, FontSize } from "@/lib/types";
import {
  getSettings,
  getDefaultSettings,
  saveSettings,
  updateTheme as storageUpdateTheme,
  updateFontSize as storageUpdateFontSize,
} from "@/lib/storage";

interface SettingsContextValue {
  settings: AppSettings;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
  setAutoComplete: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return getSystemTheme();
  return mode;
}

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
  xlarge: "20px",
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(getDefaultSettings);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // 클라이언트에서만 실제 localStorage 값으로 초기화
  useEffect(() => {
    const loaded = getSettings();
    setSettings(loaded);
    setResolvedTheme(resolveTheme(loaded.theme));
  }, []);

  // Apply theme to document
  useEffect(() => {
    const resolved = resolveTheme(settings.theme);
    setResolvedTheme(resolved);
    const root = document.documentElement;

    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved = resolveTheme("system");
      setResolvedTheme(resolved);
      if (resolved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [settings.theme]);

  // Apply font size
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-font-size",
      FONT_SIZE_MAP[settings.fontSize]
    );
  }, [settings.fontSize]);

  const setTheme = useCallback((theme: ThemeMode) => {
    const updated = storageUpdateTheme(theme);
    setSettings({ ...updated });
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    const updated = storageUpdateFontSize(size);
    setSettings({ ...updated });
  }, []);

  const setAutoComplete = useCallback((enabled: boolean) => {
    const current = getSettings();
    current.autoComplete = enabled;
    saveSettings(current);
    setSettings({ ...current });
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, resolvedTheme, setTheme, setFontSize, setAutoComplete }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
