import { Resource } from "@/models/resource";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../Api";

export const useRoutes = (resourceId: string) => {
  return useQuery(["routes", { resourceId }], () => Api.getRoutes(resourceId));
};

export const useRoute = (routeId: string) => {
  const queryClient = useQueryClient();

  return useQuery(["route", { routeId }], () => Api.getRoute(routeId), {
    onSuccess: ({ id, name, parentId, ancestors }) => {
      queryClient.setQueryData<Resource>(
        ["resource", { resourceId: routeId }],
        {
          id,
          name,
          type: "route",
          parentId,
          ancestors,
        }
      );
    },
  });
};
