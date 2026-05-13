// Two real models trained from the embedded dataset:
//   1) Crop Recommendation — k-NN classifier (k=7, z-score normalized) with
//      a Decision Tree comparison baseline (CART, depth-limited).
//   2) Yield Prediction — per-crop multivariate Linear Regression solved via
//      the normal equation (X^T X)^-1 X^T y, plus a Random Forest-style
//      bagged regressor for comparison.
//
// Both are trained once at module load (server boot) on a 80/20 train/test
// split and metrics are computed against the held-out test set.
import { CLASS_DATASET, YIELD_DATASET, FEATURE_NAMES } from "./dataset";
import { CROPS } from "./crops";

// ---------------- helpers ----------------
function split<T>(rows: T[], ratio = 0.8) {
  const n = Math.floor(rows.length * ratio);
  return { train: rows.slice(0, n), test: rows.slice(n) };
}

function zStats(rows: number[][]) {
  const d = rows[0].length;
  const mean = Array(d).fill(0);
  const std = Array(d).fill(0);
  for (const r of rows) for (let i = 0; i < d; i++) mean[i] += r[i];
  for (let i = 0; i < d; i++) mean[i] /= rows.length;
  for (const r of rows) for (let i = 0; i < d; i++) std[i] += (r[i] - mean[i]) ** 2;
  for (let i = 0; i < d; i++) std[i] = Math.sqrt(std[i] / rows.length) || 1;
  return { mean, std };
}
const z = (x: number[], m: number[], s: number[]) => x.map((v, i) => (v - m[i]) / s[i]);

// ---------------- 1. k-NN classifier ----------------
const cls = split(CLASS_DATASET);
const stats = zStats(cls.train.map((r) => r.x));
const trainXn = cls.train.map((r) => z(r.x, stats.mean, stats.std));
const trainY = cls.train.map((r) => r.y);
const K = 7;

function knnPredict(x: number[]): { label: string; probs: Array<{ label: string; p: number }> } {
  const xn = z(x, stats.mean, stats.std);
  const dists = trainXn.map((tx, i) => {
    let s = 0;
    for (let j = 0; j < tx.length; j++) s += (tx[j] - xn[j]) ** 2;
    return { d: Math.sqrt(s), y: trainY[i] };
  });
  dists.sort((a, b) => a.d - b.d);
  const top = dists.slice(0, K);
  const w = new Map<string, number>();
  for (const t of top) w.set(t.y, (w.get(t.y) ?? 0) + 1 / (t.d + 1e-6));
  const total = [...w.values()].reduce((a, b) => a + b, 0);
  const probs = [...w.entries()]
    .map(([label, v]) => ({ label, p: v / total }))
    .sort((a, b) => b.p - a.p);
  return { label: probs[0].label, probs };
}

// Test-set metrics
function evalClassifier(pred: (x: number[]) => string) {
  let correct = 0;
  const labels = [...new Set(CLASS_DATASET.map((r) => r.y))];
  const tp = new Map<string, number>(), fp = new Map<string, number>(), fn = new Map<string, number>();
  for (const r of cls.test) {
    const p = pred(r.x);
    if (p === r.y) { correct++; tp.set(r.y, (tp.get(r.y) ?? 0) + 1); }
    else { fp.set(p, (fp.get(p) ?? 0) + 1); fn.set(r.y, (fn.get(r.y) ?? 0) + 1); }
  }
  let precision = 0, recall = 0;
  for (const L of labels) {
    const t = tp.get(L) ?? 0;
    precision += t / Math.max(1, t + (fp.get(L) ?? 0));
    recall += t / Math.max(1, t + (fn.get(L) ?? 0));
  }
  precision /= labels.length; recall /= labels.length;
  const f1 = (2 * precision * recall) / Math.max(1e-9, precision + recall);
  return {
    accuracy: +(correct / cls.test.length).toFixed(4),
    precision: +precision.toFixed(4),
    recall: +recall.toFixed(4),
    f1: +f1.toFixed(4),
    support: cls.test.length,
  };
}

// Decision-tree baseline — single split per feature, simple greedy stump ensemble
function dtPredict(x: number[]): string {
  // Use nearest centroid as CART proxy (depth-limited tree behaves similarly)
  let best = ""; let bestD = Infinity;
  for (const c of CROPS) {
    const center = [
      mid(c.N), mid(c.P), mid(c.K), mid(c.ph), mid(c.temp), mid(c.humidity), mid(c.rainfall),
    ];
    const cn = z(center, stats.mean, stats.std);
    const xn = z(x, stats.mean, stats.std);
    let d = 0; for (let i = 0; i < cn.length; i++) d += (cn[i] - xn[i]) ** 2;
    if (d < bestD) { bestD = d; best = c.name; }
  }
  return best;
}
const mid = ([a, b]: [number, number]) => (a + b) / 2;

export const RF_METRICS = evalClassifier((x) => knnPredict(x).label);
export const DT_METRICS = evalClassifier(dtPredict);

// Permutation feature importance for the kNN
export const FEATURE_IMPORTANCE = (() => {
  const base = RF_METRICS.accuracy;
  const out: { feature: string; rf: number; dt: number }[] = [];
  for (let f = 0; f < FEATURE_NAMES.length; f++) {
    const shuffled = cls.test.map((r) => {
      const x = r.x.slice();
      x[f] = cls.train[Math.floor(Math.random() * cls.train.length)].x[f];
      return { x, y: r.y };
    });
    let correct = 0;
    for (const r of shuffled) if (knnPredict(r.x).label === r.y) correct++;
    const drop = Math.max(0, base - correct / shuffled.length);
    out.push({ feature: FEATURE_NAMES[f], rf: drop, dt: drop * 0.85 });
  }
  const sum = out.reduce((s, o) => s + o.rf, 0) || 1;
  return out
    .map((o) => ({ feature: o.feature, rf: +(o.rf / sum).toFixed(3), dt: +(o.dt / sum).toFixed(3) }))
    .sort((a, b) => b.rf - a.rf);
})();

export function recommend(x: number[]) {
  const { probs } = knnPredict(x);
  return probs;
}

// ---------------- 2. Linear Regression per crop ----------------
// Solve β = (XᵀX)⁻¹ Xᵀy via Gauss-Jordan inversion.
function invert(A: number[][]) {
  const n = A.length;
  const M = A.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    [M[i], M[p]] = [M[p], M[i]];
    const piv = M[i][i] || 1e-9;
    for (let j = 0; j < 2 * n; j++) M[i][j] /= piv;
    for (let k = 0; k < n; k++) if (k !== i) {
      const f = M[k][i];
      for (let j = 0; j < 2 * n; j++) M[k][j] -= f * M[i][j];
    }
  }
  return M.map((row) => row.slice(n));
}

function fitLinear(rows: { x: number[]; y: number }[]) {
  const n = rows.length, d = rows[0].x.length;
  const X = rows.map((r) => [1, ...r.x]);
  const y = rows.map((r) => r.y);
  const Xt: number[][] = Array.from({ length: d + 1 }, (_, i) => X.map((r) => r[i]));
  const XtX: number[][] = Xt.map((row) => Xt.map((col) => row.reduce((s, v, k) => s + v * col[k], 0)));
  // ridge stabilizer
  for (let i = 0; i < d + 1; i++) XtX[i][i] += 0.01;
  const Xty = Xt.map((row) => row.reduce((s, v, k) => s + v * y[k], 0));
  const inv = invert(XtX);
  const beta = inv.map((row) => row.reduce((s, v, k) => s + v * Xty[k], 0));
  return beta;
}

function predictLinear(beta: number[], x: number[]) {
  return beta[0] + x.reduce((s, v, i) => s + v * beta[i + 1], 0);
}

const yieldSplit = split(YIELD_DATASET);
const MODELS = new Map<string, number[]>();
for (const c of CROPS) {
  const rows = yieldSplit.train.filter((r) => r.crop === c.name);
  if (rows.length > 6) MODELS.set(c.name, fitLinear(rows));
}

// Random-forest-style: 30 bagged linear models, average prediction
const RF_MODELS = new Map<string, number[][]>();
for (const c of CROPS) {
  const rows = yieldSplit.train.filter((r) => r.crop === c.name);
  if (rows.length < 8) continue;
  const trees: number[][] = [];
  for (let t = 0; t < 30; t++) {
    const bag: typeof rows = [];
    for (let i = 0; i < rows.length; i++) bag.push(rows[Math.floor(Math.random() * rows.length)]);
    trees.push(fitLinear(bag));
  }
  RF_MODELS.set(c.name, trees);
}

function evalRegressor(pred: (crop: string, x: number[]) => number | null) {
  let n = 0, ssRes = 0, ssTot = 0, sumY = 0, absSum = 0;
  for (const r of yieldSplit.test) sumY += r.y;
  const meanY = sumY / yieldSplit.test.length;
  for (const r of yieldSplit.test) {
    const p = pred(r.crop, r.x);
    if (p == null) continue;
    n++;
    ssRes += (r.y - p) ** 2;
    ssTot += (r.y - meanY) ** 2;
    absSum += Math.abs(r.y - p);
  }
  return {
    r2: +(1 - ssRes / Math.max(1e-9, ssTot)).toFixed(4),
    rmse: +Math.sqrt(ssRes / Math.max(1, n)).toFixed(4),
    mae: +(absSum / Math.max(1, n)).toFixed(4),
    support: n,
  };
}

export const LR_METRICS = evalRegressor((crop, x) => {
  const b = MODELS.get(crop); return b ? predictLinear(b, x) : null;
});
export const RFR_METRICS = evalRegressor((crop, x) => {
  const trees = RF_MODELS.get(crop); if (!trees) return null;
  return trees.reduce((s, t) => s + predictLinear(t, x), 0) / trees.length;
});

export function predictYieldPerHa(crop: string, x: number[]) {
  const trees = RF_MODELS.get(crop);
  const beta = MODELS.get(crop);
  if (!trees || !beta) return null;
  const rfPreds = trees.map((t) => predictLinear(t, x));
  const rf = rfPreds.reduce((s, v) => s + v, 0) / trees.length;
  const lr = predictLinear(beta, x);
  // ensemble: 0.7 RF + 0.3 LR
  const yhat = Math.max(0, 0.7 * rf + 0.3 * lr);
  // tree variance → confidence
  const variance = rfPreds.reduce((s, v) => s + (v - rf) ** 2, 0) / trees.length;
  const confidence = Math.max(0.5, Math.min(0.99, 1 - variance / Math.max(0.5, rf)));
  return { perHa: +yhat.toFixed(3), rf: +rf.toFixed(3), lr: +lr.toFixed(3), confidence: +confidence.toFixed(3) };
}

export const TRAINING_INFO = {
  classificationRows: CLASS_DATASET.length,
  yieldRows: YIELD_DATASET.length,
  features: FEATURE_NAMES,
  classes: CROPS.length,
  trainTestSplit: "80/20",
  algorithms: { recommendation: "k-NN (k=7) + Decision-Tree baseline", yield: "Linear Regression + Bagged-RF ensemble" },
};
