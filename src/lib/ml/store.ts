// Tiny prediction history store backed by localStorage
export type HistoryItem = {
  id: string;
  type: "recommendation" | "yield";
  timestamp: number;
  summary: string;
  detail: Record<string, string | number>;
};

const KEY = "fc_history_v1";

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function pushHistory(item: Omit<HistoryItem, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  const all = getHistory();
  all.unshift({ ...item, id: crypto.randomUUID(), timestamp: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
}
export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
