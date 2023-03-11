import { z } from "zod";
import { ResourceBase, resourceBaseSchema } from "./resource";

export type Area = Omit<ResourceBase, "name"> & {
  name: string;
};

export const areaSchema: z.ZodType<Area> = resourceBaseSchema
  .omit({ name: true })
  .extend({
    name: z.string(),
  });
