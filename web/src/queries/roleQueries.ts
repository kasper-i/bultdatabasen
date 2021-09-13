import { useQuery } from "react-query";

export const useRole = (resourceId: string) => {
  const { data } = useQuery<string>(["role", { resourceId }]);
  return { role: data };
};
