import { z } from "zod";
import { ResourceBase, resourceBaseSchema } from "./resource";
import { Author, authorSchema } from "./user";

export type Comment = ResourceBase & {
  text: string;
  tags: string[];
  createdAt: Date;
  author: Author;
};

export const commentSchema: z.ZodType<Comment> = resourceBaseSchema.extend({
  text: z.string(),
  tags: z.array(z.string().uuid()),
  createdAt: z.coerce.date(),
  author: authorSchema,
});
