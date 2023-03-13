import { z } from "zod";

export type Manufacturer = z.infer<typeof manufacturerSchema>;

export const manufacturerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});
