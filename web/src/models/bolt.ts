import { z } from "zod";
import { ResourceBase, resourceBaseSchema } from "./resource";

const boltTypeSchema = z.union([
  z.literal("glue"),
  z.literal("expansion"),
  z.literal("piton"),
]);

export type BoltType = z.infer<typeof boltTypeSchema>;

const boltPositionSchema = z.union([z.literal("left"), z.literal("right")]);

export type BoltPosition = z.infer<typeof boltPositionSchema>;

const diameterUnitSchema = z.union([z.literal("mm"), z.literal("inch")]);

export type DiameterUnit = z.infer<typeof diameterUnitSchema>;

export type Bolt = ResourceBase & {
  type: BoltType;
  parentId: string;
  position?: BoltPosition;
  installed?: Date;
  dismantled?: Date;
  manufacturerId?: string;
  manufacturer?: string;
  modelId?: string;
  model?: string;
  material?: string;
  materialId?: string;
  diameter?: number;
  diameterUnit?: DiameterUnit;
};

export const boltSchema: z.ZodType<Bolt> = resourceBaseSchema.extend({
  type: boltTypeSchema,
  parentId: z.string().uuid(),
  position: boltPositionSchema.optional(),
  installed: z.coerce.date().optional(),
  dismantled: z.coerce.date().optional(),
  manufacturerId: z.string().uuid().optional(),
  manufacturer: z.string().optional(),
  modelId: z.string().uuid().optional(),
  model: z.string().optional(),
  material: z.string().optional(),
  materialId: z.string().uuid().optional(),
  diameter: z.number().optional(),
  diameterUnit: diameterUnitSchema.optional(),
});
