export type UserRole = "owner" | "guest";

export interface ResourceRole {
  resourceID: string;
  role: UserRole;
}
