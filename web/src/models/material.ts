import { z } from "zod";

export const materialSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Material = z.infer<typeof materialSchema>;
