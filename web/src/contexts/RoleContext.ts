import { createContext } from "react";

interface RoleContextProps {
  isOwner: boolean;
}

export const RoleContext = createContext<RoleContextProps>({isOwner: false});
