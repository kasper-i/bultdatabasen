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

export const routeTypes: RouteType[] = [
  "sport",
  "traditional",
  "partially_bolted",
  "top_rope",
  "aid",
  "dws",
];

export type Route = Omit<ResourceBase, "name"> & {
  name: string;
  altName?: string;
  year?: number;
  length?: number;
  routeType: RouteType;
};

export const editableRouteSchema = z.object({
  name: z.string().min(1),
  altName: z.string().optional(),
  year: z.number().min(1900).max(new Date().getFullYear()).optional(),
  length: z.number().optional(),
  routeType: routeTypeSchema,
});

export const routeSchema: z.ZodType<Route> = resourceBaseSchema
  .omit({ name: true })
  .merge(editableRouteSchema);
