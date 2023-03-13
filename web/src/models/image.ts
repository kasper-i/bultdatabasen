import { z } from "zod";
import { ResourceBase, resourceBaseSchema } from "./resource";

const imageRotationSchema = z.union([
  z.literal(0),
  z.literal(90),
  z.literal(180),
  z.literal(270),
]);

export type ImageRotation = z.infer<typeof imageRotationSchema>;

const imageVersionSchema = z.union([
  z.literal("xs"),
  z.literal("sm"),
  z.literal("md"),
  z.literal("lg"),
  z.literal("xl"),
  z.literal("2xl"),
]);

export type ImageVersion = z.infer<typeof imageVersionSchema>;

export type Image = ResourceBase & {
  mimeType: string;
  timestamp: Date;
  description?: string;
  rotation?: ImageRotation;
  size: number;
  width: number;
  height: number;
  userId: string;
};

export const imageSchema: z.ZodType<Image> = resourceBaseSchema.extend({
  mimeType: z.string(),
  timestamp: z.coerce.date(),
  description: z.string().optional(),
  rotation: imageRotationSchema.optional(),
  size: z.number(),
  width: z.number(),
  height: z.number(),
  userId: z.string(),
});
