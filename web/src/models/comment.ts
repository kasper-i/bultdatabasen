import { z } from "zod";
import { ResourceBase, resourceBaseSchema } from "./resource";
import { User, userSchema } from "./user";

export type Comment = ResourceBase & {
  text: string;
  tags: string[];
  createdAt: Date;
  userId: string;
  user?: User;
};

export const commentSchema: z.ZodType<Comment> = resourceBaseSchema.extend({
  text: z.string(),
  tags: z.array(z.string().uuid()),
  createdAt: z.coerce.date(),
  userId: z.string(),
  user: userSchema.optional(),
});
