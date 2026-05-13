export function LabeledSlider({
  label, unit, min, max, step = 1, value, onChange, hint,
}: {
  label: string; unit?: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="font-display text-base font-semibold text-primary">
          {value}{unit && <span className="ml-0.5 text-xs text-muted-foreground">{unit}</span>}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--primary)]"
        style={{
          background: `linear-gradient(to right, oklch(0.78 0.18 155) 0%, oklch(0.72 0.16 195) ${
            ((value - min) / (max - min)) * 100
          }%, oklch(1 0 0 / 0.1) ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
