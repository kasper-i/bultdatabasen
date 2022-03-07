import { UserRole } from "@/models/role";
import { createContext } from "react";

interface RoleContextProps {
  role?: UserRole;
}

export const RoleContext = createContext<RoleContextProps>({});
