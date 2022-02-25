export type UserRole = "owner" | "guest";

export interface Role {
  resourceID: string;
  role: UserRole;
}
