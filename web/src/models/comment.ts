import { z } from "zod";
import { ResourceBase, resourceBaseSchema } from "./resource";

export type Comment = ResourceBase & {
  text: string;
  tags: string[];
};

export const commentSchema: z.ZodType<Comment> = resourceBaseSchema.extend({
  text: z.string(),
  tags: z.array(z.string().uuid()),
});
