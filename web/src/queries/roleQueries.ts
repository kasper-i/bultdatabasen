import { Api } from "@/Api";
import { selectAuthenticated } from "@/slices/authSlice";
import { useAppSelector } from "@/store";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

export const useRole = (resourceId: string) => {
  const isAuthenticated = useAppSelector(selectAuthenticated);

  const { data } = useQuery(
    ["role", { resourceId }],
    async () => Api.getUserRoleForResource(resourceId),
    {
      select: (role) => role.role,
      retry: (failureCount, error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          return false;
        }

        return failureCount <= 2;
      },
      enabled: isAuthenticated,
      staleTime: 1000 * 60 * 15,
      cacheTime: 1000 * 60 * 15,
    }
  );

  return { role: data ?? "guest" };
};
