import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/farm/Nav";
import { GlassCard, SectionTitle, StatCard } from "@/components/farm/Card";
import { Activity, Cpu, Leaf, Sprout, TrendingUp, Droplets, Thermometer, CloudRain } from "lucide-react";
import { Area, AreaChart, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { tooltipStyle } from "@/routes/recommendation";
import { MODEL_METRICS } from "@/lib/ml/crops";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FarmConnect" },
      { name: "description", content: "Centralized AI agriculture dashboard with KPIs, model performance, weather and soil insights." },
    ],
  }),
  component: Dashboard,
});

const monthly = [
  { m: "Jan", recs: 24, yield: 3.2 }, { m: "Feb", recs: 38, yield: 3.6 },
  { m: "Mar", recs: 52, yield: 4.0 }, { m: "Apr", recs: 70, yield: 4.4 },
  { m: "May", recs: 88, yield: 5.0 }, { m: "Jun", recs: 96, yield: 5.4 },
  { m: "Jul", recs: 110, yield: 5.7 },{ m: "Aug", recs: 134, yield: 6.0 },
];

const cropMix = [
  { name: "Rice", value: 32, color: "oklch(0.78 0.18 155)" },
  { name: "Maize", value: 22, color: "oklch(0.72 0.16 195)" },
  { name: "Cotton", value: 14, color: "oklch(0.7 0.2 320)" },
  { name: "Banana", value: 12, color: "oklch(0.78 0.15 85)" },
  { name: "Other", value: 20, color: "oklch(0.55 0.05 220)" },
];

function Dashboard() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionTitle eyebrow="AI Control Center" title="FarmConnect Dashboard" sub="A single pane of glass for predictions, model health, and field intelligence." />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Predictions"   value="1,284" sub="last 30 days"          icon={Activity}   accent="emerald" />
          <StatCard label="Recommendations" value="842" sub="+18% week over week"   icon={Leaf}       accent="cyan" />
          <StatCard label="Avg Yield"     value="5.4 t" sub="per hectare"           icon={TrendingUp} accent="violet" />
          <StatCard label="Best Model"    value="RF"    sub={`${(MODEL_METRICS.recommendation[0].accuracy*100).toFixed(1)}% accuracy`} icon={Cpu} accent="amber" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <GlassCard className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Predictions volume & avg yield</h4>
              <span className="text-xs text-muted-foreground">Trailing 8 months</span>
            </div>
            <div className="mt-4 h-72">
              <ResponsiveContainer>
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%"  stopColor="oklch(0.78 0.18 155)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.78 0.18 155)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%"  stopColor="oklch(0.72 0.16 195)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.72 0.16 195)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                  <XAxis dataKey="m" stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="recs"  stroke="oklch(0.78 0.18 155)" strokeWidth={2} fill="url(#g1)" />
                  <Area type="monotone" dataKey="yield" stroke="oklch(0.72 0.16 195)" strokeWidth={2} fill="url(#g2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="text-sm font-semibold">Recommended crop mix</h4>
            <div className="mt-2 h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={cropMix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                    {cropMix.map((c) => <Cell key={c.name} fill={c.color} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <GlassCard>
            <h4 className="text-sm font-semibold">Soil health heatmap</h4>
            <p className="text-xs text-muted-foreground">NPK levels across 7 monitored zones.</p>
            <Heatmap />
          </GlassCard>

          <GlassCard className="lg:col-span-2">
            <h4 className="text-sm font-semibold">Weather overview · 7 days</h4>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const t = 22 + Math.round(Math.sin(i)*4 + i*0.4);
                return (
                  <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                    <p className="text-[10px] uppercase text-muted-foreground">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</p>
                    <Thermometer className="mx-auto mt-2 h-4 w-4 text-accent" />
                    <p className="mt-1 font-display text-base font-semibold">{t}°</p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <Droplets className="h-3 w-3" /> {60 + i*3}%
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <CloudRain className="h-3 w-3" /> {10 + i*5}mm
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 h-48">
              <ResponsiveContainer>
                <LineChart data={Array.from({ length: 14 }, (_, i) => ({ d: `D${i+1}`, r: 60 + Math.round(Math.sin(i*0.7)*15 + i*1.2) }))}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                  <XAxis dataKey="d" stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line dataKey="r" stroke="oklch(0.72 0.16 195)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <GlassCard>
            <div className="flex items-center gap-2"><Sprout className="h-4 w-4 text-primary" /><h4 className="text-sm font-semibold">AI Insights</h4></div>
            <ul className="mt-3 space-y-3 text-sm">
              <Insight title="Increase potassium by ~12 kg/ha" body="Soil zone B is trending below the optimal K window for grape cultivation." />
              <Insight title="Switch zone D to maize next cycle" body="Forecast climate window favors maize over chickpea by 14% expected yield." />
              <Insight title="Irrigation savings detected" body="Reduce irrigation 8% in zone A — humidity is consistently >75% this week." />
            </ul>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-2"><Cpu className="h-4 w-4 text-accent" /><h4 className="text-sm font-semibold">Model performance snapshot</h4></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {MODEL_METRICS.recommendation.map((m) => (
                <div key={m.model} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-xs text-muted-foreground">{m.model}</p>
                  <p className="font-display text-2xl font-bold text-primary">{(m.accuracy*100).toFixed(1)}%</p>
                  <p className="text-[10px] text-muted-foreground">F1 {m.f1.toFixed(2)} · P {m.precision.toFixed(2)}</p>
                </div>
              ))}
              {MODEL_METRICS.yield.map((m) => (
                <div key={m.model} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-xs text-muted-foreground">{m.model.replace(" Regressor","")}</p>
                  <p className="font-display text-2xl font-bold text-accent">R² {m.r2.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">RMSE {m.rmse} · MAE {m.mae}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

function Insight({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
    </li>
  );
}

function Heatmap() {
  const zones = ["A","B","C","D","E","F","G"];
  const nutrients = ["N","P","K"];
  // deterministic-ish data
  const data = zones.map((z, zi) =>
    nutrients.map((n, ni) => Math.round(35 + Math.sin(zi*1.3 + ni) * 30 + Math.cos(zi+ni*1.7) * 15))
  );
  const color = (v: number) => {
    const t = Math.max(0, Math.min(1, v / 100));
    return `oklch(${0.4 + t * 0.45} ${0.05 + t * 0.18} 155)`;
  };
  return (
    <div className="mt-3">
      <div className="grid grid-cols-[auto_repeat(3,1fr)] gap-1 text-[10px] text-muted-foreground">
        <div></div>
        {nutrients.map((n) => <div key={n} className="text-center">{n}</div>)}
        {zones.map((z, zi) => (
          <>
            <div key={z+"l"} className="self-center pr-1 text-right">{z}</div>
            {data[zi].map((v, ni) => (
              <div key={z+ni} className="aspect-square rounded-md ring-1 ring-white/5"
                style={{ background: color(v) }} title={`${z}-${nutrients[ni]}: ${v}`} />
            ))}
          </>
        ))}
      </div>
    </div>
  );
}
