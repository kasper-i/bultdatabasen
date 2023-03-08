import { Api } from "@/Api";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useRoles = (userId?: string) => {
  const { data: roles } = useQuery(
    ["roles", { userId }],
    () => Api.getUserRoles(userId ?? ""),
    {
      retry: (failureCount, error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          return false;
        }

        return failureCount <= 2;
      },
      enabled: !!userId,
      staleTime: 1000 * 60 * 60 * 12,
      cacheTime: 1000 * 60 * 60 * 12,
    }
  );

  return { roles };
};
