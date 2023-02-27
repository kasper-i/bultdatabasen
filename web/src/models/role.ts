export type UserRole = "owner" | "guest";

export interface ResourceRole {
  resourceId: string;
  role: UserRole;
}
