import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/farm/Nav";
import { GlassCard, SectionTitle } from "@/components/farm/Card";
import { clearHistory, getHistory, type HistoryItem } from "@/lib/ml/store";
import { Download, Trash2, Leaf, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Prediction History — FarmConnect" },
      { name: "description", content: "Review and export your past crop recommendations and yield predictions." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => { setItems(getHistory()); }, []);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "farmconnect-history.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between">
          <SectionTitle eyebrow="Activity" title="Prediction History" sub="Every recommendation and yield forecast you've run." />
          <div className="mb-6 flex gap-2">
            <button onClick={exportJson} disabled={!items.length}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium hover:bg-white/10 disabled:opacity-40">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button onClick={() => { clearHistory(); setItems([]); }} disabled={!items.length}
              className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/20 disabled:opacity-40">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>

        {!items.length ? (
          <GlassCard className="grid place-items-center py-16 text-center">
            <p className="text-sm text-muted-foreground">No predictions yet. Try the recommendation or yield modules.</p>
          </GlassCard>
        ) : (
          <div className="grid gap-3">
            {items.map((it) => (
              <GlassCard key={it.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ${it.type === "recommendation" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"}`}>
                    {it.type === "recommendation" ? <Leaf className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{it.summary}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(it.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer select-none">Details</summary>
                  <pre className="mt-2 rounded-lg bg-black/30 p-2 text-[10px]">{JSON.stringify(it.detail, null, 2)}</pre>
                </details>
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
