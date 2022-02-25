import { Api } from "@/Api";
import { Role, UserRole } from "@/models/role";
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
