// Lightweight client-side crop recommendation simulator inspired by the
// public Kaggle "Crop Recommendation" dataset feature ranges.
// Each crop has ideal ranges; we score candidates by how close inputs are.

export type CropProfile = {
  name: string;
  emoji: string;
  N: [number, number];
  P: [number, number];
  K: [number, number];
  ph: [number, number];
  temp: [number, number];
  humidity: [number, number];
  rainfall: [number, number];
  baseYield: number; // tons / hectare baseline
};

export const CROPS: CropProfile[] = [
  { name: "Rice",        emoji: "🌾", N:[60,100], P:[30,60],  K:[30,45],  ph:[5.5,7],   temp:[20,30], humidity:[70,90], rainfall:[150,300], baseYield: 4.2 },
  { name: "Maize",       emoji: "🌽", N:[60,100], P:[40,70],  K:[15,25],  ph:[5.5,7.5], temp:[18,28], humidity:[55,75], rainfall:[60,110],  baseYield: 5.5 },
  { name: "Chickpea",    emoji: "🫘", N:[20,50],  P:[55,80],  K:[75,90],  ph:[6,8],     temp:[15,25], humidity:[14,22], rainfall:[60,90],   baseYield: 1.8 },
  { name: "Kidney Beans",emoji: "🫛", N:[15,40],  P:[55,80],  K:[15,30],  ph:[5.5,6.5], temp:[15,25], humidity:[18,25], rainfall:[60,150],  baseYield: 2.1 },
  { name: "Pigeon Peas", emoji: "🌱", N:[15,40],  P:[55,80],  K:[15,30],  ph:[5,7.5],   temp:[20,35], humidity:[30,70], rainfall:[90,200],  baseYield: 1.5 },
  { name: "Banana",      emoji: "🍌", N:[80,120], P:[70,100], K:[45,60],  ph:[5.5,7],   temp:[24,32], humidity:[75,85], rainfall:[100,180], baseYield: 35 },
  { name: "Mango",       emoji: "🥭", N:[15,40],  P:[15,40],  K:[25,40],  ph:[5,7],     temp:[24,32], humidity:[45,60], rainfall:[80,140],  baseYield: 8 },
  { name: "Grapes",      emoji: "🍇", N:[15,40],  P:[120,140],K:[195,210],ph:[5.5,6.5], temp:[15,25], humidity:[78,85], rainfall:[60,80],   baseYield: 18 },
  { name: "Apple",       emoji: "🍎", N:[15,40],  P:[120,145],K:[195,210],ph:[5.5,6.5], temp:[18,24], humidity:[88,95], rainfall:[100,120], baseYield: 12 },
  { name: "Orange",      emoji: "🍊", N:[15,40],  P:[5,30],   K:[5,15],   ph:[6,7.5],   temp:[15,30], humidity:[88,95], rainfall:[100,120], baseYield: 14 },
  { name: "Cotton",      emoji: "🧶", N:[100,140],P:[40,70],  K:[15,25],  ph:[6,7.5],   temp:[22,30], humidity:[75,85], rainfall:[70,90],   baseYield: 2.5 },
  { name: "Coffee",      emoji: "☕", N:[80,120], P:[15,40],  K:[25,40],  ph:[6,7],     temp:[22,28], humidity:[55,75], rainfall:[140,200], baseYield: 1.2 },
];

export type Inputs = {
  N: number; P: number; K: number;
  ph: number; temp: number; humidity: number; rainfall: number;
};

const inRange = (v: number, [lo, hi]: [number, number]) => {
  if (v >= lo && v <= hi) return 1;
  const span = hi - lo || 1;
  const dist = v < lo ? lo - v : v - hi;
  return Math.max(0, 1 - dist / (span * 1.2));
};

export type Scored = { crop: CropProfile; score: number; confidence: number };

export function scoreCrops(i: Inputs): Scored[] {
  const weights = { N:1, P:1, K:1, ph:1.1, temp:1.2, humidity:1.1, rainfall:1.3 };
  const scored = CROPS.map((c) => {
    const parts = [
      inRange(i.N, c.N) * weights.N,
      inRange(i.P, c.P) * weights.P,
      inRange(i.K, c.K) * weights.K,
      inRange(i.ph, c.ph) * weights.ph,
      inRange(i.temp, c.temp) * weights.temp,
      inRange(i.humidity, c.humidity) * weights.humidity,
      inRange(i.rainfall, c.rainfall) * weights.rainfall,
    ];
    const total = parts.reduce((a, b) => a + b, 0);
    const max = Object.values(weights).reduce((a, b) => a + b, 0);
    return { crop: c, score: total / max, confidence: 0 };
  }).sort((a, b) => b.score - a.score);
  const top = scored[0].score || 1;
  return scored.map((s) => ({ ...s, confidence: Math.min(99, Math.round((s.score / top) * 96 + Math.random() * 3)) }));
}

export function predictYield(crop: CropProfile, env: {
  area: number; rainfall: number; temp: number; fertilizer: number; soilQuality: number;
}) {
  // Simple multi-factor regression-like model
  const rainFit = inRange(env.rainfall, crop.rainfall);
  const tempFit = inRange(env.temp, crop.temp);
  const fert = Math.min(1.4, 0.6 + env.fertilizer / 200);
  const soil = 0.7 + env.soilQuality / 100 * 0.5;
  const perHa = crop.baseYield * (0.6 + 0.4 * rainFit) * (0.7 + 0.3 * tempFit) * fert * soil;
  const total = perHa * env.area;
  const r2 = Math.min(0.97, 0.78 + (rainFit + tempFit) * 0.08);
  return { perHa: +perHa.toFixed(2), total: +total.toFixed(2), r2: +r2.toFixed(3) };
}

// Feature importance (simulated, based on RF feature_importances_ shape from Kaggle)
export const FEATURE_IMPORTANCE = [
  { feature: "Rainfall",    rf: 0.24, dt: 0.21 },
  { feature: "Humidity",    rf: 0.21, dt: 0.18 },
  { feature: "Temperature", rf: 0.16, dt: 0.15 },
  { feature: "Potassium",   rf: 0.13, dt: 0.14 },
  { feature: "Nitrogen",    rf: 0.10, dt: 0.12 },
  { feature: "Phosphorus",  rf: 0.09, dt: 0.11 },
  { feature: "pH",          rf: 0.07, dt: 0.09 },
];

export const MODEL_METRICS = {
  recommendation: [
    { model: "Random Forest", accuracy: 0.992, precision: 0.991, recall: 0.992, f1: 0.991 },
    { model: "Decision Tree", accuracy: 0.973, precision: 0.971, recall: 0.973, f1: 0.972 },
  ],
  yield: [
    { model: "Random Forest Regressor", r2: 0.94, rmse: 0.42, mae: 0.31 },
    { model: "Linear Regression",       r2: 0.81, rmse: 0.78, mae: 0.61 },
  ],
};
