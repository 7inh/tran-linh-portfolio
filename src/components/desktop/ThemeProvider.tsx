"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "portfolio-theme";

type ThemeContextValue = {
  dark: boolean;
  setDark: (dark: boolean) => void;
  toggleDark: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyDomDark(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Matches layout.tsx's server render (which always ships `dark`), so this
  // first client render agrees with the SSR markup. The effect below corrects
  // it a tick later — to a stored choice, or the OS setting — exactly as
  // layout.tsx's blocking script already did before paint.
  const [dark, setDarkState] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const next = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkState(next);
    applyDomDark(next);
  }, []);

  const setDark = useCallback((value: boolean) => {
    setDarkState(value);
    applyDomDark(value);
    window.localStorage.setItem(STORAGE_KEY, value ? "dark" : "light");
  }, []);

  const toggleDark = useCallback(() => {
    setDarkState((prev) => {
      const next = !prev;
      applyDomDark(next);
      window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ dark, setDark, toggleDark }),
    [dark, setDark, toggleDark]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
