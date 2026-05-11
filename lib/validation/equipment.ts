import { z } from "zod";

export const equipmentSchema = z.object({
  kind: z.enum(["grinder", "dripper", "kettle"]),
  name: z.string().min(1).max(80),
  grind_unit: z.string().max(40).optional().nullable(),
  temp_control: z.boolean().optional().nullable(),
  is_default: z.boolean().default(false),
});

export type EquipmentInput = z.infer<typeof equipmentSchema>;
