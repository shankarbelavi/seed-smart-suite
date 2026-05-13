import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, Cloud, Droplets, Thermometer, CloudRain, FlaskConical, Sparkles, Loader2, TrendingUp } from "lucide-react";
import { Nav } from "@/components/farm/Nav";
import { GlassCard, SectionTitle } from "@/components/farm/Card";
import { LabeledSlider } from "@/components/farm/Slider";
import { FEATURE_IMPORTANCE, MODEL_METRICS, type Inputs } from "@/lib/ml/crops";
import { recommendCrop } from "@/lib/ml/predict.functions";
import { useServerFn } from "@tanstack/react-start";
import { pushHistory } from "@/lib/ml/store";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export const Route = createFileRoute("/recommendation")({
  head: () => ({
    meta: [
      { title: "Crop Recommendation — FarmConnect" },
      { name: "description", content: "Get the right crop for your soil with Random Forest predictions and explainable feature importance." },
    ],
  }),
  component: RecommendationPage,
});

function RecommendationPage() {
  const [inputs, setInputs] = useState<Inputs>({
    N: 90, P: 42, K: 43, ph: 6.5, temp: 24, humidity: 80, rainfall: 200,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof recommendCrop>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recommendFn = useServerFn(recommendCrop);

  const update = (k: keyof Inputs) => (v: number) => setInputs((p) => ({ ...p, [k]: v }));

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recommendFn({ data: inputs });
      setResult(res);
      pushHistory({
        type: "recommendation",
        summary: `${res.top.emoji} ${res.top.name} — ${res.top.confidence}% confidence`,
        detail: { ...inputs, crop: res.top.name, confidence: res.top.confidence },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const top = result?.top;
  const alts = result?.alternates ?? [];

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionTitle
          eyebrow="Module 1 · Random Forest + Decision Tree"
          title="Crop Recommendation"
          sub="Tune the soil and weather signals on the left. The model evaluates 22 candidate crops and explains its choice."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* INPUTS */}
          <GlassCard className="space-y-6">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-semibold">Soil & Climate Inputs</h3>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <LabeledSlider label="Nitrogen (N)"   unit=" kg/ha" min={0}  max={140} value={inputs.N}        onChange={update("N")} />
              <LabeledSlider label="Phosphorus (P)" unit=" kg/ha" min={5}  max={145} value={inputs.P}        onChange={update("P")} />
              <LabeledSlider label="Potassium (K)"  unit=" kg/ha" min={5}  max={205} value={inputs.K}        onChange={update("K")} />
              <LabeledSlider label="Soil pH"                       min={3.5} max={9}   step={0.1} value={inputs.ph} onChange={update("ph")} />
              <LabeledSlider label="Temperature"    unit="°C"      min={5}  max={45}  step={0.5} value={inputs.temp}     onChange={update("temp")} />
              <LabeledSlider label="Humidity"       unit="%"       min={10} max={100} value={inputs.humidity} onChange={update("humidity")} />
              <LabeledSlider label="Rainfall"       unit=" mm"     min={20} max={300} value={inputs.rainfall} onChange={update("rainfall")} />
            </div>

            <button
              onClick={run} disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gradient-emerald)] px-5 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01] disabled:opacity-70"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Running ensemble…</> : <><Sparkles className="h-4 w-4" /> Recommend Crop</>}
            </button>
            {error && <p className="text-xs text-destructive">⚠️ {error}</p>}
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Powered by <span className="text-primary">POST /_serverFn/recommendCrop</span>
            </p>

            {/* Weather mini cards */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <MiniWeather icon={Thermometer} label="Temp" value={`${inputs.temp}°`} />
              <MiniWeather icon={Droplets} label="Humidity" value={`${inputs.humidity}%`} />
              <MiniWeather icon={CloudRain} label="Rain" value={`${inputs.rainfall}mm`} />
            </div>
          </GlassCard>

          {/* OUTPUT */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {!result && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GlassCard className="grid place-items-center py-16 text-center">
                    <Cloud className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">Run the model to see your recommendation.</p>
                  </GlassCard>
                </motion.div>
              )}
              {top && (
                <motion.div key={top.name}
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}>
                  <GlassCard className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-[var(--gradient-emerald)] opacity-10" />
                    <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-stretch">
                      <div className="grid h-32 w-32 shrink-0 place-items-center rounded-2xl bg-white/10 text-7xl ring-1 ring-white/10">
                        {top.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-primary">Recommended</p>
                        <h3 className="font-display text-4xl font-bold">{top.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Best fit for the supplied soil and climate. Random Forest is the leading model.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-primary/15 px-3 py-1 text-primary">RF: {(MODEL_METRICS.recommendation[0].accuracy*100).toFixed(1)}% acc</span>
                          <span className="rounded-full bg-accent/15 px-3 py-1 text-accent">DT: {(MODEL_METRICS.recommendation[1].accuracy*100).toFixed(1)}% acc</span>
                        </div>
                      </div>
                      <div className="grid place-items-center">
                        <ConfidenceMeter value={top.confidence} />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            {alts.length > 0 && (
              <GlassCard>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4 text-accent" /> Alternative crops
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {alts.slice(0, 3).map((a) => (
                    <div key={a.name} className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                      <div className="text-3xl">{a.emoji}</div>
                      <p className="mt-1 text-sm font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.confidence}%</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            <FeatureImportanceCard />
          </div>
        </div>

        {/* MODEL COMPARISON */}
        <div className="mt-6">
          <ModelComparisonCard />
        </div>
      </main>
    </div>
  );
}

function MiniWeather({ icon: Icon, label, value }: { icon: React.ComponentType<{className?:string}>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
      <Icon className="h-4 w-4 text-accent" />
      <div className="leading-tight">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const data = [{ name: "c", value, fill: "oklch(0.78 0.18 155)" }];
  return (
    <div className="relative h-32 w-32">
      <ResponsiveContainer>
        <RadialBarChart innerRadius="75%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: "oklch(1 0 0 / 0.06)" }} dataKey="value" cornerRadius={20} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-primary">{value}%</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">confidence</p>
        </div>
      </div>
    </div>
  );
}

function FeatureImportanceCard() {
  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Beaker className="h-4 w-4 text-primary" /> Feature importance
        </h4>
        <span className="text-xs text-muted-foreground">Random Forest</span>
      </div>
      <div className="mt-4 h-56">
        <ResponsiveContainer>
          <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 10, right: 10 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="feature" width={90} stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ fill: "oklch(1 0 0 / 0.05)" }} contentStyle={tooltipStyle} />
            <Bar dataKey="rf" fill="oklch(0.78 0.18 155)" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

function ModelComparisonCard() {
  const data = MODEL_METRICS.recommendation.map((m) => ({
    model: m.model.replace(" Classifier",""),
    Accuracy: +(m.accuracy*100).toFixed(1),
    Precision: +(m.precision*100).toFixed(1),
    Recall: +(m.recall*100).toFixed(1),
    F1: +(m.f1*100).toFixed(1),
  }));
  return (
    <GlassCard>
      <h4 className="text-sm font-semibold">Model comparison</h4>
      <p className="text-xs text-muted-foreground">Accuracy, precision, recall and F1 across both classifiers.</p>
      <div className="mt-4 h-72">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="model" stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 12 }} />
            <YAxis domain={[90, 100]} stroke="oklch(0.72 0.03 220)" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="Accuracy" fill="oklch(0.78 0.18 155)" radius={[6,6,0,0]} />
            <Bar dataKey="Precision" fill="oklch(0.72 0.16 195)" radius={[6,6,0,0]} />
            <Bar dataKey="Recall" fill="oklch(0.78 0.15 85)" radius={[6,6,0,0]} />
            <Bar dataKey="F1" fill="oklch(0.7 0.2 320)" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export const tooltipStyle = {
  background: "oklch(0.21 0.04 240 / 0.95)",
  border: "1px solid oklch(1 0 0 / 0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "white",
};
