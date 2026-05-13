import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CROPS, scoreCrops, predictYield, MODEL_METRICS, FEATURE_IMPORTANCE } from "@/lib/ml/crops";

const InputsSchema = z.object({
  N: z.number().min(0).max(200),
  P: z.number().min(0).max(200),
  K: z.number().min(0).max(250),
  ph: z.number().min(0).max(14),
  temp: z.number().min(-10).max(60),
  humidity: z.number().min(0).max(100),
  rainfall: z.number().min(0).max(500),
});

export const recommendCrop = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputsSchema.parse(input))
  .handler(async ({ data }) => {
    // Simulated server-side latency for realism
    await new Promise((r) => setTimeout(r, 250));
    const scored = scoreCrops(data).slice(0, 5).map((s) => ({
      name: s.crop.name,
      emoji: s.crop.emoji,
      confidence: s.confidence,
      score: +s.score.toFixed(4),
    }));
    return {
      top: scored[0],
      alternates: scored.slice(1),
      featureImportance: FEATURE_IMPORTANCE,
      models: MODEL_METRICS.recommendation,
      bestModel: "Random Forest",
      servedAt: new Date().toISOString(),
    };
  });

const YieldSchema = z.object({
  crop: z.string(),
  area: z.number().min(0.1).max(10000),
  rainfall: z.number().min(0).max(500),
  temp: z.number().min(-10).max(60),
  fertilizer: z.number().min(0).max(500),
  soilQuality: z.number().min(0).max(100),
});

export const predictYieldFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => YieldSchema.parse(input))
  .handler(async ({ data }) => {
    await new Promise((r) => setTimeout(r, 250));
    const profile = CROPS.find((c) => c.name === data.crop);
    if (!profile) throw new Error(`Unknown crop: ${data.crop}`);
    const r = predictYield(profile, {
      area: data.area, rainfall: data.rainfall, temp: data.temp,
      fertilizer: data.fertilizer, soilQuality: data.soilQuality,
    });
    return {
      crop: profile.name,
      emoji: profile.emoji,
      perHa: r.perHa,
      total: r.total,
      r2: r.r2,
      models: MODEL_METRICS.yield,
      bestModel: "Random Forest Regressor",
      servedAt: new Date().toISOString(),
    };
  });
