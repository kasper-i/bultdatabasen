import { createContext } from "react";

interface AuthContextProps {
  isAuthenticated: boolean;
  setAuthenticated: (authenticated: boolean) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  setAuthenticated: () => {},
});
