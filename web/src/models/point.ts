import { z } from "zod";
import {
  ancestorSchema,
  Parent,
  ResourceBase,
  resourceBaseSchema,
} from "./resource";

export type Point = Omit<ResourceBase, "name"> & {
  parents: Parent[];
  number: number;
  anchor: boolean;
};

export const pointSchema: z.ZodType<Point> = resourceBaseSchema
  .omit({ name: true })
  .extend({
    parents: z.array(ancestorSchema),
    number: z.number(),
    anchor: z.boolean(),
  });
