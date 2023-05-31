import { Resource } from "@/models/resource";
import { Route } from "@/models/route";
import {
  QueryClient,
  QueryFilters,
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
        const { id, name, ancestors, counters } = data;
        const resource: Resource = {
          id,
          name,
          ancestors,
          counters,
          type: "route",
        };

        queryClient.setQueryData<Resource>(
          ["resource", { resourceId: id }],
          resource
        );

        queryClient.setQueryData(["route", { routeId: id }], data);

        ancestors?.forEach((ancestor) => {
          addToListings<Route>(
            queryClient,
            { queryKey: ["routes", { resourceId: ancestor.id }] },
            data
          );

          addToListings<Resource>(
            queryClient,
            { queryKey: ["children", { resourceId: ancestor.id }] },
            resource
          );
        });
      },
    }
  );
};

export const useUpdateRoute = (routeId: string) => {
  const queryClient = useQueryClient();

  return useMutation((route: Route) => Api.updateRoute(routeId, route), {
    onSuccess: async (data) => {
      const { id, name, ancestors, counters } = data;
      const resource: Resource = {
        id,
        name,
        ancestors,
        counters,
        type: "route",
      };

      queryClient.setQueryData<Resource>(
        ["resource", { resourceId: id }],
        resource
      );

      queryClient.setQueryData(["route", { routeId: id }], data);

      ancestors?.forEach((ancestor) => {
        updateInListings<Route>(
          queryClient,
          { queryKey: ["routes", { resourceId: ancestor.id }] },
          ({ id }) => id === routeId,
          data
        );

        updateInListings<Resource>(
          queryClient,
          { queryKey: ["children", { resourceId: ancestor.id }] },
          ({ id }) => id === routeId,
          resource
        );
      });
    },
  });
};

export const useDeleteRoute = (routeId: string) => {
  const queryClient = useQueryClient();

  return useMutation(() => Api.deleteRoute(routeId), {
    onSuccess: async () => {
      removeFromListings<Route>(
        queryClient,
        { queryKey: ["routes"], exact: false },
        ({ id }) => id === routeId
      );

      removeFromListings<Resource>(
        queryClient,
        { queryKey: ["children"], exact: false },
        ({ id }) => id === routeId
      );
    },
  });
};

const addToListings = <T>(
  queryClient: QueryClient,
  filters: QueryFilters,
  data: T
) =>
  queryClient.setQueriesData<T[]>(filters, (list) =>
    list === undefined ? undefined : [...list, data]
  );

const updateInListings = <T>(
  queryClient: QueryClient,
  filters: QueryFilters,
  predicate: (data: T) => boolean,
  data: T
) =>
  queryClient.setQueriesData<T[]>(filters, (list) =>
    list === undefined
      ? undefined
      : list.map((old) => (predicate(old) ? data : old))
  );

const removeFromListings = <T>(
  queryClient: QueryClient,
  filters: QueryFilters,
  predicate: (data: T) => boolean
) =>
  queryClient.setQueriesData<T[]>(filters, (list) =>
    list === undefined ? undefined : list.filter((data) => !predicate(data))
  );
