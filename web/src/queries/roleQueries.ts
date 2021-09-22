import { UserRole } from "models/user";
import { useQuery } from "react-query";

export const useRole = (resourceId: string) => {
  const { data } = useQuery<UserRole>(["role", { resourceId }], async () =>
    Promise.resolve<UserRole>("guest")
  );
  return { role: data };
};
