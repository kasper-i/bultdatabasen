import { z } from "zod";
import { ResourceBase, resourceBaseSchema } from "./resource";
import { Author, authorSchema } from "./user";

const taskStatusSchema = z.union([
  z.literal("open"),
  z.literal("assigned"),
  z.literal("closed"),
  z.literal("rejected"),
]);

export type TaskStatus = z.infer<typeof taskStatusSchema>;

export type Task = ResourceBase & {
  status: TaskStatus;
  description: string;
  priority: number;
  assignee?: string;
  comment?: string;
  createdAt: Date;
  author: Author;
  closedAt?: Date;
};

export const taskSchema: z.ZodType<Task> = resourceBaseSchema.extend({
  status: taskStatusSchema,
  description: z.string(),
  priority: z.number(),
  assignee: z.string().optional(),
  comment: z.string().optional(),
  createdAt: z.coerce.date(),
  author: authorSchema,
  closedAt: z.coerce.date().optional(),
});
