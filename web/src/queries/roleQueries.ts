import { queryClient } from "index";
import { useQuery } from "react-query";

interface UseRole {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export const useRole = (resourceId: string): UseRole => {
  const data = queryClient.getQueryData(["role", { resourceId }]) as string;
  return {
    canCreate: data === "owner",
    canEdit: data === "owner",
    canDelete: data === "owner",
  };
};
