// Embedded synthetic-but-realistic agricultural dataset.
// Generated deterministically from per-crop agronomic ranges (Kaggle "Crop
// Recommendation Dataset" + ICAR yield references). Used to train both models
// at server startup so predictions are produced by actual fitted estimators.
import { CROPS, type CropProfile } from "./crops";

export type ClassSample = { x: number[]; y: string };
export type YieldSample = { crop: string; x: number[]; y: number };

// Deterministic PRNG so every server boot trains identical models.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20240513);

const draw = ([lo, hi]: [number, number], jitter = 0.12) => {
  const span = hi - lo;
  const noise = (rand() - 0.5) * span * jitter;
  return +(lo + rand() * span + noise).toFixed(2);
};

// ---------- Crop-recommendation dataset (2,640 rows · 7 features · 22→12 classes) ----------
function buildClassification(): ClassSample[] {
  const rows: ClassSample[] = [];
  const PER_CLASS = 220;
  for (const c of CROPS) {
    for (let i = 0; i < PER_CLASS; i++) {
      rows.push({
        x: [draw(c.N), draw(c.P), draw(c.K), draw(c.ph, 0.05), draw(c.temp), draw(c.humidity), draw(c.rainfall)],
        y: c.name,
      });
    }
  }
  // Shuffle
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  return rows;
}

// ---------- Yield dataset (≈1,200 rows · 5 features → tons/ha) ----------
function buildYield(): YieldSample[] {
  const rows: YieldSample[] = [];
  for (const c of CROPS) {
    for (let i = 0; i < 100; i++) {
      const area = +(rand() * 80 + 1).toFixed(2);
      const rainfall = draw(c.rainfall, 0.4);
      const temp = draw(c.temp, 0.3);
      const fert = +(rand() * 250 + 20).toFixed(1);
      const soil = +(rand() * 70 + 30).toFixed(1);
      // Latent generative model — gives both ML signal and noise.
      const rainFit = fit(rainfall, c.rainfall);
      const tempFit = fit(temp, c.temp);
      const fertF = Math.min(1.4, 0.6 + fert / 200);
      const soilF = 0.7 + (soil / 100) * 0.5;
      const noise = 1 + (rand() - 0.5) * 0.18;
      const yPerHa = c.baseYield * (0.6 + 0.4 * rainFit) * (0.7 + 0.3 * tempFit) * fertF * soilF * noise;
      rows.push({ crop: c.name, x: [area, rainfall, temp, fert, soil], y: +yPerHa.toFixed(3) });
    }
  }
  return rows;
}

function fit(v: number, [lo, hi]: [number, number]) {
  if (v >= lo && v <= hi) return 1;
  const span = hi - lo || 1;
  const d = v < lo ? lo - v : v - hi;
  return Math.max(0, 1 - d / (span * 1.2));
}

export const CLASS_DATASET: ClassSample[] = buildClassification();
export const YIELD_DATASET: YieldSample[] = buildYield();
export const FEATURE_NAMES = ["N", "P", "K", "pH", "Temperature", "Humidity", "Rainfall"];
export const YIELD_FEATURES = ["Area", "Rainfall", "Temperature", "Fertilizer", "Soil Quality"];
export { CROPS };
export type { CropProfile };
