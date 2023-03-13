import { z } from "zod";

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  firstSeen: Date;
}

export const userSchema: z.ZodType<User> = z.object({
  id: z.string(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  firstSeen: z.coerce.date(),
});
