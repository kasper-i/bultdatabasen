import { z } from "zod";

const userRoleSchema = z.union([
  z.literal("maintainer"),
  z.literal("owner"),
  z.literal("guest"),
]);

export type UserRole = z.infer<typeof userRoleSchema>;

export interface ResourceRole {
  resourceId: string;
  role: UserRole;
}

export const resourceRoleSchema: z.ZodType<ResourceRole> = z.object({
  resourceId: z.string().uuid(),
  role: userRoleSchema,
});
