import { Permission } from "@/models/permission";
import { createContext } from "react";

interface PermissionContextProps {
  permissions: Permission[];
}

export const PermissionContext = createContext<PermissionContextProps>({
  permissions: [],
});
