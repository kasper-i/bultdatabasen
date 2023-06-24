import { z } from "zod";
import { ResourceBase, resourceBaseSchema } from "./resource";

export type Crag = Omit<ResourceBase, "name"> & {
  name: string;
};

export const cragSchema: z.ZodType<Crag> = resourceBaseSchema
  .omit({ name: true })
  .extend({
    name: z.string(),
  });
