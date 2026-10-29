import { useCallback, useState } from "react";

const KEY = "rangkumin:history:v1";
const MAX = 20;

const load = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch { return []; }
};
const save = (items) => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* penuh/diblokir */ } };

export function useHistory() {
  const [items, setItems] = useState(load);

  const add = useCallback((item) => {
    setItems((prev) => { const next = [item, ...prev.filter((x) => x.id !== item.id)].slice(0, MAX); save(next); return next; });
  }, []);
  const remove = useCallback((id) => {
    setItems((prev) => { const next = prev.filter((x) => x.id !== id); save(next); return next; });
  }, []);
  const clear = useCallback(() => { save([]); setItems([]); }, []);

  return { items, add, remove, clear };
}
