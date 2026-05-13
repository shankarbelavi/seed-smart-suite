import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

export function GlassCard({
  children, className = "", delay = 0, ...rest
}: { children: ReactNode; className?: string; delay?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`glass rounded-2xl p-5 ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({
  label, value, sub, icon: Icon, accent = "emerald",
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "emerald" | "cyan" | "violet" | "amber";
}) {
  const accents: Record<string, string> = {
    emerald: "from-emerald/20 to-emerald/0 text-primary",
    cyan: "from-cyan-glow/25 to-cyan-glow/0 text-accent",
    violet: "from-chart-4/25 to-chart-4/0 text-chart-4",
    amber: "from-chart-5/25 to-chart-5/0 text-chart-5",
  };
  return (
    <GlassCard className="relative overflow-hidden">
      <div className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${accents[accent]} blur-2xl`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10 ${accents[accent].split(" ").pop()}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </GlassCard>
  );
}

export function SectionTitle({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
      {sub && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}
