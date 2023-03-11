import { z } from "zod";
import { ResourceBase, resourceBaseSchema } from "./resource";

export type Sector = Omit<ResourceBase, "name"> & {
  name: string;
};

export const cragSchema: z.ZodType<Sector> = resourceBaseSchema
  .omit({ name: true })
  .extend({
    name: z.string(),
  });
