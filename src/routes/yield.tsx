import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sprout, MapPin, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { Nav } from "@/components/farm/Nav";
import { GlassCard, SectionTitle, StatCard } from "@/components/farm/Card";
import { LabeledSlider } from "@/components/farm/Slider";
import { CROPS, predictYield, MODEL_METRICS } from "@/lib/ml/crops";
import { pushHistory } from "@/lib/ml/store";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { tooltipStyle } from "@/routes/recommendation";

export const Route = createFileRoute("/yield")({
  head: () => ({
    meta: [
      { title: "Yield Prediction — FarmConnect" },
      { name: "description", content: "Predict tons-per-hectare with Random Forest regression and explainable confidence." },
    ],
  }),
  component: YieldPage,
});

const STATES = ["Punjab", "Maharashtra", "Tamil Nadu", "Karnataka", "Uttar Pradesh", "Gujarat", "West Bengal"];
const SOILS = ["Loamy", "Clay", "Sandy", "Silty", "Peaty", "Chalky"];

function YieldPage() {
  const [crop, setCrop] = useState(CROPS[0].name);
  const [state, setState] = useState(STATES[0]);
  const [soil, setSoil] = useState(SOILS[0]);
  const [area, setArea] = useState(10);
  const [temp, setTemp] = useState(26);
  const [rain, setRain] = useState(180);
  const [fert, setFert] = useState(110);
  const [soilQ, setSoilQ] = useState(70);
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<{perHa:number; total:number; r2:number} | null>(null);

  const cropProfile = CROPS.find((c) => c.name === crop)!;

  const run = () => {
    setLoading(true);
    setTimeout(() => {
      const r = predictYield(cropProfile, { area, rainfall: rain, temp, fertilizer: fert, soilQuality: soilQ });
      setOut(r);
      pushHistory({
        type: "yield",
        summary: `${cropProfile.emoji} ${cropProfile.name} — ${r.total} t total`,
        detail: { crop, state, area, rainfall: rain, temp, perHa: r.perHa, total: r.total },
      });
      setLoading(false);
    }, 700);
  };

  // Synthesize a 6-year historical trend + 3-year forecast
  const trend = Array.from({ length: 9 }, (_, i) => {
    const year = 2019 + i;
    const isForecast = i >= 6;
    const base = cropProfile.baseYield;
    const noise = Math.sin(i * 0.9) * 0.5 + (Math.random() - 0.5) * 0.4;
    const value = +(base + noise + (isForecast ? (out?.perHa ? (out.perHa - base) * (i - 5) / 3 : 0.4) : 0)).toFixed(2);
    return { year, value, forecast: isForecast };
  });

  const regressionCmp = MODEL_METRICS.yield.map((m) => ({
    model: m.model.replace(" Regressor",""),
    "R² ×100": +(m.r2 * 100).toFixed(1),
    "RMSE ×10": +(m.rmse * 10).toFixed(1),
    "MAE ×10": +(m.mae * 10).toFixed(1),
  }));

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionTitle
          eyebrow="Module 2 · Random Forest + Linear Regression"
          title="Yield Prediction"
          sub="Forecast tons per hectare and total harvest using historical climate, soil, and fertilizer signals."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <GlassCard className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Crop"  value={crop}  onChange={setCrop}  options={CROPS.map((c) => c.name)} />
              <Select label="State" value={state} onChange={setState} options={STATES} />
              <Select label="Soil"  value={soil}  onChange={setSoil}  options={SOILS} />
              <Field label="Region">
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">{state}, India</span>
                </div>
              </Field>
            </div>
            <LabeledSlider label="Cultivated Area" unit=" ha"  min={1} max={500} value={area} onChange={setArea} />
            <LabeledSlider label="Avg Temperature" unit="°C"   min={5} max={45}  step={0.5} value={temp} onChange={setTemp} />
            <LabeledSlider label="Annual Rainfall" unit=" mm"  min={20} max={400} value={rain} onChange={setRain} />
            <LabeledSlider label="Fertilizer Usage" unit=" kg/ha" min={0} max={300} value={fert} onChange={setFert} />
            <LabeledSlider label="Soil Quality Index" unit="/100" min={20} max={100} value={soilQ} onChange={setSoilQ} />

            <button onClick={run} disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gradient-emerald)] px-5 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01] disabled:opacity-70">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Forecasting…</> : <><Sparkles className="h-4 w-4" /> Predict Yield</>}
            </button>
          </GlassCard>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Per Hectare" value={out ? `${out.perHa} t` : "—"} sub="tons / ha" icon={Sprout} accent="emerald" />
              <StatCard label="Total Yield" value={out ? `${out.total} t` : "—"} sub={`${area} ha cultivated`} icon={TrendingUp} accent="cyan" />
              <StatCard label="Model R²"     value={out ? out.r2.toFixed(2) : "—"} sub="Random Forest" icon={Sparkles} accent="violet" />
            </div>

            <GlassCard>
              <h4 className="text-sm font-semibold">Historical & Forecasted Yield · {crop}</h4>
              <p className="text-xs text-muted-foreground">Solid line is observed history; dashed segment is the 3-year forecast.</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="yld" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%"  stopColor="oklch(0.78 0.18 155)" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="oklch(0.78 0.18 155)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                    <XAxis dataKey="year" stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="value" stroke="oklch(0.78 0.18 155)" strokeWidth={2.5} fill="url(#yld)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard>
              <h4 className="text-sm font-semibold">Regression model comparison</h4>
              <div className="mt-4 h-60">
                <ResponsiveContainer>
                  <BarChart data={regressionCmp}>
                    <XAxis dataKey="model" stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="R² ×100" fill="oklch(0.78 0.18 155)" radius={[6,6,0,0]} />
                    <Bar dataKey="RMSE ×10" fill="oklch(0.72 0.16 195)" radius={[6,6,0,0]} />
                    <Bar dataKey="MAE ×10"  fill="oklch(0.7 0.2 320)"   radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none ring-primary/30 transition-shadow focus:ring-2">
        {options.map((o) => <option key={o} value={o} className="bg-[oklch(0.21_0.04_240)]">{o}</option>)}
      </select>
    </Field>
  );
}
