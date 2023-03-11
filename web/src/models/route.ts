import { z } from "zod";
import { ResourceBase, resourceBaseSchema } from "./resource";

const routeTypeSchema = z.union([
  z.literal("sport"),
  z.literal("traditional"),
  z.literal("partially_bolted"),
  z.literal("top_rope"),
  z.literal("aid"),
  z.literal("dws"),
]);

export type RouteType = z.infer<typeof routeTypeSchema>;

export type Route = Omit<ResourceBase, "name"> & {
  name: string;
  altName?: string;
  year?: number;
  length?: number;
  routeType: RouteType;
};

export const routeSchema: z.ZodType<Route> = resourceBaseSchema
  .omit({ name: true })
  .extend({
    name: z.string(),
    altName: z.string().optional(),
    year: z.number().min(1960).max(new Date().getFullYear()).optional(),
    length: z.number().optional(),
    routeType: routeTypeSchema,
  });
