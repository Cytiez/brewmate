import { z } from "zod";

const pourSchema = z.object({
  time_seconds: z.coerce.number().int().min(0).max(3600),
  water_g: z.coerce.number().min(0).max(9999),
});

export const brewLogSchema = z.object({
  bean_id: z.string().uuid(),
  grinder_id: z.string().uuid().optional().nullable(),
  dripper_id: z.string().uuid(),
  kettle_id: z.string().uuid().optional().nullable(),
  dose_g: z.coerce.number().positive().max(999),
  water_g: z.coerce.number().positive().max(99999),
  water_temp_c: z.coerce.number().min(0).max(100).optional().nullable(),
  grind_size: z.string().min(1).max(40),
  brew_time_seconds: z.coerce.number().int().positive().max(3600),
  bloom_time_seconds: z.coerce.number().int().min(0).max(600).optional().nullable(),
  bloom_water_g: z.coerce.number().min(0).max(999).optional().nullable(),
  immersion: z.coerce.boolean().default(false),
  pours: z.array(pourSchema).max(12).default([]),
  taste_rating: z.enum(["too_bitter", "too_sour", "too_weak", "too_strong", "flat", "great"]),
  taste_note: z.string().max(500).optional().nullable(),
  brewed_at: z.string().datetime().optional(),
});

export type BrewLogInput = z.infer<typeof brewLogSchema>;
export type PourInput = z.infer<typeof pourSchema>;
