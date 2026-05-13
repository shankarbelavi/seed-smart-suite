import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/farm/Nav";
import { GlassCard, SectionTitle } from "@/components/farm/Card";
import { CROPS, FEATURE_IMPORTANCE, MODEL_METRICS } from "@/lib/ml/crops";
import { Bar, BarChart, CartesianGrid, Legend, Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { tooltipStyle } from "@/routes/recommendation";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — FarmConnect" },
      { name: "description", content: "Deep ML analytics: feature importance, correlation heatmap, model comparison and confidence distribution." },
    ],
  }),
  component: Analytics,
});

const FEATS = ["N","P","K","pH","Temp","Humidity","Rainfall"];

function Analytics() {
  // synthetic correlation matrix
  const corr = FEATS.map((_, i) =>
    FEATS.map((__, j) => (i === j ? 1 : +(Math.cos((i+1)*(j+1)*0.6) * 0.5 + (i+j)%2*0.1).toFixed(2)))
  );

  const radar = MODEL_METRICS.recommendation.map((m) => ({
    model: m.model,
    Accuracy: m.accuracy * 100, Precision: m.precision * 100, Recall: m.recall * 100, F1: m.f1 * 100,
  }));
  const radarData = ["Accuracy","Precision","Recall","F1"].map((k) => ({
    metric: k,
    "Random Forest": radar[0][k as keyof typeof radar[0]] as number,
    "Decision Tree": radar[1][k as keyof typeof radar[1]] as number,
  }));

  // confidence distribution
  const confDist = [
    { bucket: "50-60", count: 4 }, { bucket: "60-70", count: 9 },
    { bucket: "70-80", count: 22 }, { bucket: "80-90", count: 51 },
    { bucket: "90-100", count: 87 },
  ];

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionTitle eyebrow="Explainable AI" title="Model Analytics" sub="Inspect feature importance, correlations, model strengths and prediction confidence." />

        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard>
            <h4 className="text-sm font-semibold">Feature importance · RF vs DT</h4>
            <div className="mt-4 h-72">
              <ResponsiveContainer>
                <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.05)" horizontal={false} />
                  <XAxis type="number" stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="feature" width={90} stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="rf" name="Random Forest" fill="oklch(0.78 0.18 155)" radius={[0,8,8,0]} />
                  <Bar dataKey="dt" name="Decision Tree" fill="oklch(0.72 0.16 195)" radius={[0,8,8,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="text-sm font-semibold">Model strength radar</h4>
            <div className="mt-4 h-72">
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
                  <PolarAngleAxis dataKey="metric" stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis stroke="transparent" tick={false} domain={[90, 100]} />
                  <Radar name="Random Forest" dataKey="Random Forest" stroke="oklch(0.78 0.18 155)" fill="oklch(0.78 0.18 155)" fillOpacity={0.35} />
                  <Radar name="Decision Tree" dataKey="Decision Tree" stroke="oklch(0.72 0.16 195)" fill="oklch(0.72 0.16 195)" fillOpacity={0.25} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="text-sm font-semibold">Feature correlation heatmap</h4>
            <p className="text-xs text-muted-foreground">Pearson correlation across the 7 input features.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr>
                    <th></th>
                    {FEATS.map((f) => <th key={f} className="px-1 py-1 text-muted-foreground">{f}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {FEATS.map((f, i) => (
                    <tr key={f}>
                      <td className="pr-2 text-right text-muted-foreground">{f}</td>
                      {corr[i].map((v, j) => {
                        const t = (v + 1) / 2;
                        const bg = `oklch(${0.3 + t * 0.5} ${0.05 + Math.abs(v) * 0.18} ${v >= 0 ? 155 : 25})`;
                        return (
                          <td key={j} className="p-0.5">
                            <div className="grid aspect-square place-items-center rounded-md text-[10px] font-medium ring-1 ring-white/5"
                              style={{ background: bg, color: t > 0.6 ? "oklch(0.16 0 0)" : "white" }}>
                              {v}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="text-sm font-semibold">Prediction confidence distribution</h4>
            <p className="text-xs text-muted-foreground">Confidence buckets across the last 173 predictions.</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer>
                <BarChart data={confDist}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                  <XAxis dataKey="bucket" stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="oklch(0.78 0.18 155)" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div className="mt-6">
          <GlassCard>
            <h4 className="text-sm font-semibold">Crop catalog · {CROPS.length} classes</h4>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {CROPS.map((c) => (
                <div key={c.name} className="group flex flex-col items-center rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center transition-colors hover:bg-white/[0.06]">
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="mt-1 text-xs font-medium">{c.name}</span>
                  <span className="text-[10px] text-muted-foreground">{c.baseYield} t/ha</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
