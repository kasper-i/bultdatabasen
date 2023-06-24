import { z } from "zod";

export const materialSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

export type Material = z.infer<typeof materialSchema>;
