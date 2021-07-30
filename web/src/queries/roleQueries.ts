import { queryClient } from "index";

interface UseRole {
  role?: string;
}

export const useRole = (resourceId: string): UseRole => {
  const data = queryClient.getQueryData(["role", { resourceId }]) as
    | string
    | undefined;
  return {
    role: data,
  };
};
