import { z } from "zod";

export const beanSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  roaster: z.string().max(120).optional().nullable(),
  origin_country: z.string().max(80).optional().nullable(),
  origin_region: z.string().max(120).optional().nullable(),
  process: z.enum(["washed", "natural", "honey", "anaerobic", "other"]).optional().nullable(),
  roast_level: z.enum(["light", "medium", "dark"]).optional().nullable(),
  altitude_masl: z.coerce.number().int().positive().max(5000).optional().nullable(),
  density: z.enum(["low", "medium", "high"]).optional().nullable(),
  flavor_notes: z.array(z.string().min(1).max(40)).max(20).default([]),
  roast_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  is_active: z.boolean().default(false),
});

export type BeanInput = z.infer<typeof beanSchema>;
