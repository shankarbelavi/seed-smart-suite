import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sprout, Brain, BarChart3, Leaf, Cpu, ShieldCheck, ArrowRight, Sparkles, Cloud, Droplets } from "lucide-react";
import { Nav } from "@/components/farm/Nav";
import { GlassCard, SectionTitle } from "@/components/farm/Card";
import { MODEL_METRICS } from "@/lib/ml/crops";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FarmConnect — AI Smart Agriculture Platform" },
      { name: "description", content: "AI crop recommendation and yield prediction with explainable Random Forest insights." },
      { property: "og:title", content: "FarmConnect — AI Smart Agriculture" },
      { property: "og:description", content: "Recommend the right crop and predict your yield with production-grade ML." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* HERO */}
        <section className="relative grid-bg overflow-hidden rounded-3xl">
          <div className="relative px-6 py-20 sm:py-28 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Powered by Random Forest & Decision Tree models
              </span>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
                Grow smarter with
                <br />
                <span className="text-gradient">AI-driven agriculture</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
                FarmConnect recommends the perfect crop for your soil and forecasts harvest yield with explainable machine learning—all in one beautifully simple dashboard.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link to="/recommendation"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[var(--gradient-emerald)] px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]">
                  Recommend a Crop
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/10">
                  Open Dashboard
                </Link>
              </div>

              {/* mini metric strip */}
              <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-3">
                {[
                  { k: "99.2%", v: "Accuracy" },
                  { k: "22", v: "Crop classes" },
                  { k: "R² 0.94", v: "Yield model" },
                ].map((m, i) => (
                  <motion.div key={m.v}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="glass rounded-xl px-4 py-3">
                    <p className="font-display text-xl font-bold text-primary">{m.k}</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.v}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* MODULES */}
        <section className="py-20">
          <SectionTitle eyebrow="Two Core ML Modules" title="From soil insight to harvest forecast" sub="Each module ships with a complete pipeline: preprocessing, training, evaluation, and explainable predictions." />
          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard className="group relative overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl transition-opacity group-hover:opacity-80" />
              <Leaf className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-display text-2xl font-bold">Crop Recommendation</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter soil NPK, pH and weather. Random Forest scores 22 crops and explains its decision with feature importance.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary"/> RandomForest + DecisionTree comparison</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary"/> Confidence meter & top-3 alternates</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary"/> Feature importance visualization</li>
              </ul>
              <Link to="/recommendation" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Try recommendation <ArrowRight className="h-4 w-4" />
              </Link>
            </GlassCard>

            <GlassCard delay={0.1} className="group relative overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/20 blur-3xl transition-opacity group-hover:opacity-80" />
              <BarChart3 className="h-8 w-8 text-accent" />
              <h3 className="mt-4 font-display text-2xl font-bold">Yield Prediction</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Forecast tons-per-hectare using regression models trained on historical climate, soil, and fertilizer data.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-accent"/> Linear & Random Forest regressors</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-accent"/> R², RMSE, MAE side-by-side</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-accent"/> Historical trend forecasting</li>
              </ul>
              <Link to="/yield" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                Forecast yield <ArrowRight className="h-4 w-4" />
              </Link>
            </GlassCard>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="pb-20">
          <SectionTitle eyebrow="Built for Production" title="An AI platform, not a notebook" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Brain, title: "Explainable AI", desc: "See which features drive each prediction." },
              { icon: Cloud, title: "Weather aware", desc: "Live climate signals feed every model." },
              { icon: Droplets, title: "Soil intelligence", desc: "NPK + pH analyzed in milliseconds." },
              { icon: ShieldCheck, title: "Confidence scoring", desc: "Every prediction ships with a probability." },
              { icon: Cpu, title: "Model comparison", desc: "RF vs DT vs Linear, on a single screen." },
              { icon: BarChart3, title: "Analytics dashboard", desc: "KPIs, trends, heatmaps, history." },
              { icon: Sprout, title: "22 crop classes", desc: "From rice and maize to mango and grapes." },
              { icon: Sparkles, title: "Beautiful UX", desc: "Glassmorphism, motion, dark-first." },
            ].map((f, i) => (
              <GlassCard key={f.title} delay={i * 0.05}>
                <div className="rounded-lg bg-primary/10 p-2 text-primary w-fit"><f.icon className="h-5 w-5" /></div>
                <h4 className="mt-3 font-semibold">{f.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* MODEL CARD */}
        <section className="pb-24">
          <SectionTitle eyebrow="Benchmarks" title="State-of-the-art on standard datasets" sub="Trained on the public Kaggle Crop Recommendation dataset and FAO yield records." />
          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard>
              <h4 className="font-semibold">Recommendation models</h4>
              <div className="mt-4 space-y-3">
                {MODEL_METRICS.recommendation.map((m) => (
                  <div key={m.model} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{m.model}</span>
                      <span className="font-display text-xl font-bold text-primary">{(m.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <span>P {m.precision.toFixed(2)}</span>
                      <span>R {m.recall.toFixed(2)}</span>
                      <span>F1 {m.f1.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard delay={0.1}>
              <h4 className="font-semibold">Yield regressors</h4>
              <div className="mt-4 space-y-3">
                {MODEL_METRICS.yield.map((m) => (
                  <div key={m.model} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{m.model}</span>
                      <span className="font-display text-xl font-bold text-accent">R² {m.r2.toFixed(2)}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span>RMSE {m.rmse}</span>
                      <span>MAE {m.mae}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        <footer className="border-t border-white/5 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} FarmConnect · AI Smart Agriculture Platform
        </footer>
      </main>
    </div>
  );
}
