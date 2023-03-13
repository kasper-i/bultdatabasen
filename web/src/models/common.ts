import { z } from "zod";

const metaSchema = z.object({
  totalItems: z.number(),
});

export type Meta = z.infer<typeof metaSchema>;

export type Page<T> = {
  data: T[];
  meta: Meta;
};

export const pageSchema = <T>(dataSchema: z.ZodType<T>): z.ZodType<Page<T>> =>
  z.object({
    data: z.array(dataSchema),
    meta: metaSchema,
  });
