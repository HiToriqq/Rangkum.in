import { useCallback, useEffect, useState } from "react";

const KEY = "theme";
const stored = () => { try { return localStorage.getItem(KEY); } catch { return null; } };

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");

  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (stored()) return;
      const next = mq.matches ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch { /* storage diblokir */ }
    setTheme(next);
  }, [theme]);

  return [theme, toggle];
}
