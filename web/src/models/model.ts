import { z } from "zod";
import {
  BoltType,
  boltTypeSchema,
  DiameterUnit,
  diameterUnitSchema,
} from "./bolt";

export interface Model {
  id: string;
  name: string;
  manufacturerId: string;
  type?: BoltType;
  materialId?: string;
  diameter?: number;
  diameterUnit?: DiameterUnit;
}

export const modelSchema: z.ZodType<Model> = z.object({
  id: z.string().uuid(),
  name: z.string(),
  manufacturerId: z.string().uuid(),
  type: boltTypeSchema.optional(),
  materialId: z.string().uuid().optional(),
  diameter: z.number().optional(),
  diameterUnit: diameterUnitSchema.optional(),
});
