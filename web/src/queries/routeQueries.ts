import { Resource, ResourceBase, ResourceType } from "@/models/resource";
import { Route } from "@/models/route";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Api } from "../Api";

export const useRoutes = (resourceId: string) => {
  return useQuery(["routes", { resourceId }], () => Api.getRoutes(resourceId));
};

export const useRoute = (routeId: string) => {
  const queryClient = useQueryClient();

  return useQuery(["route", { routeId }], () => Api.getRoute(routeId), {
    onSuccess: ({ id, name, ancestors, counters }) => {
      queryClient.setQueryData<Resource>(
        ["resource", { resourceId: routeId }],
        {
          id,
          name,
          type: "route",
          ancestors,
          counters,
        }
      );
    },
  });
};

export const useCreateRoute = (parentId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    (route: Omit<Route, "id">) => Api.createRoute(parentId, route),
    {
      onSuccess: async (data) => {
        updateCache(queryClient, data, "route");
      },
    }
  );
};

export const useEditRoute = (routeId: string) => {
  const queryClient = useQueryClient();

  return useMutation((route: Route) => Api.updateRoute(routeId, route), {
    onSuccess: async (data) => {
      updateCache(queryClient, data, "route");
    },
  });
};

const updateCache = <T extends ResourceBase>(
  queryClient: QueryClient,
  data: T,
  resourceType: ResourceType
) => {
  const { id, name, ancestors, counters } = data;
  const resource: Resource = {
    id,
    name,
    ancestors,
    counters,
    type: resourceType,
  };

  queryClient.setQueryData<Resource>(
    ["resource", { resourceId: id }],
    resource
  );

  queryClient.setQueryData(["route", { routeId: id }], data);

  ancestors
    ?.filter((ancestor) => ancestor.type !== "root")
    ?.forEach((ancestor) => {
      queryClient.setQueryData<T[]>(
        ["routes", { resourceId: ancestor.id }],
        (old) => (old === undefined ? undefined : [...old, data])
      );

      queryClient.setQueryData<Resource[]>(
        ["children", { resourceId: ancestor.id }],
        (old) => (old === undefined ? undefined : [...old, resource])
      );
    });
};
