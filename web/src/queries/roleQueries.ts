import { UserRole } from "models/user";
import { useQuery } from "react-query";

export const useRole = (resourceId: string) => {
  const { data } = useQuery<UserRole>(
    ["role", { resourceId }],
    async () => Promise.resolve<UserRole>("guest"),
    {
      staleTime: 1000 * 60 * 60 * 24 * 365,
    }
  );
  return { role: data };
};
