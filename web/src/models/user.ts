export type UserRole = "owner" | "guest";

export interface User {
  id: string;
  email?: string;
  name?: string;
  joinDate?: string;
}
