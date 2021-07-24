import { createContext } from "react";

interface RoleContextProps {
  role?: string;
}

export const RoleContext = createContext<RoleContextProps>({});
