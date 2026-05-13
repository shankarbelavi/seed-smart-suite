import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CROPS } from "./crops";
import {
  recommend, predictYieldPerHa,
  RF_METRICS, DT_METRICS, LR_METRICS, RFR_METRICS,
  FEATURE_IMPORTANCE, TRAINING_INFO,
} from "./trained";

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
    const x = [data.N, data.P, data.K, data.ph, data.temp, data.humidity, data.rainfall];
    const probs = recommend(x);
    const top5 = probs.slice(0, 5).map((p) => {
      const c = CROPS.find((c) => c.name === p.label)!;
      return { name: c.name, emoji: c.emoji, confidence: Math.round(p.p * 100), score: +p.p.toFixed(4) };
    });
    return {
      top: top5[0],
      alternates: top5.slice(1),
      featureImportance: FEATURE_IMPORTANCE,
      models: [
        { model: "Random Forest (k-NN)", ...RF_METRICS },
        { model: "Decision Tree", ...DT_METRICS },
      ],
      bestModel: "Random Forest (k-NN)",
      training: TRAINING_INFO,
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
    const profile = CROPS.find((c) => c.name === data.crop);
    if (!profile) throw new Error(`Unknown crop: ${data.crop}`);
    const x = [data.area, data.rainfall, data.temp, data.fertilizer, data.soilQuality];
    const r = predictYieldPerHa(data.crop, x);
    if (!r) throw new Error(`No trained model for ${data.crop}`);
    return {
      crop: profile.name,
      emoji: profile.emoji,
      perHa: r.perHa,
      total: +(r.perHa * data.area).toFixed(2),
      r2: RFR_METRICS.r2,
      confidence: r.confidence,
      models: [
        { model: "Random Forest Regressor", ...RFR_METRICS },
        { model: "Linear Regression", ...LR_METRICS },
      ],
      bestModel: "Random Forest Regressor",
      training: TRAINING_INFO,
      servedAt: new Date().toISOString(),
    };
  });
