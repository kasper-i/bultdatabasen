import { z } from "zod";

export const resourceTypeSchema = z.union([
  z.literal("root"),
  z.literal("area"),
  z.literal("crag"),
  z.literal("sector"),
  z.literal("route"),
  z.literal("point"),
  z.literal("bolt"),
  z.literal("comment"),
  z.literal("image"),
  z.literal("task"),
]);

export type ResourceType = z.infer<typeof resourceTypeSchema>;

export interface Counters {
  openTasks?: number;
  installedBolts?: number;
  routes?: number;
}

export const countersSchema: z.ZodType<Counters> = z.object({
  openTasks: z.optional(z.number()),
  installedBolts: z.optional(z.number()),
  routes: z.optional(z.number()),
});

export interface Ancestor {
  id: string;
  name?: string;
  type: ResourceType;
}

export const ancestorSchema: z.ZodType<Ancestor> = z.object({
  id: z.string().uuid(),
  name: z.optional(z.string()),
  type: resourceTypeSchema,
});

export interface ResourceBase {
  id: string;
  name?: string;
  ancestors?: Ancestor[];
  counters?: Counters;
}

export type Resource = ResourceBase & {
  type: ResourceType;
};

export const resourceBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.optional(z.string()),
  counters: z.optional(countersSchema),
  ancestors: z.optional(z.array(ancestorSchema)),
});

export const resourceSchema: z.ZodType<Resource> = resourceBaseSchema.extend({
  type: resourceTypeSchema,
});

export type Parent = Ancestor;

export interface SearchResult {
  id: string;
  name: string;
  type: ResourceType;
  parents: Parent[];
}

export const searchResultSchema: z.ZodType<SearchResult> = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: resourceTypeSchema,
  parents: z.array(ancestorSchema),
});
