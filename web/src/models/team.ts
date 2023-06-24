import { z } from "zod";

export interface Team {
  id: string;
  name: string;
}

export const teamSchema: z.ZodType<Team> = z.object({
  id: z.string().uuid(),
  name: z.string(),
});
