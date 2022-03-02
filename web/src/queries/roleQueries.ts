import { Api } from "@/Api";
import { useQuery } from "react-query";

export const useRole = (resourceId: string) => {
  const { data } = useQuery(
    ["role", { resourceId }],
    async () => Api.getUserRoleForResource(resourceId),
    {
      select: (role) => role.role,
      staleTime: 1000 * 60 * 30,
    }
  );
  return { role: data };
};
