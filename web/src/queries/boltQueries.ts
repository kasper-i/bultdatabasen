import { Bolt } from "@/models/bolt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../Api";

export const useBolts = (resourceId: string) =>
  useQuery(["bolts", { resourceId }], () => Api.getBolts(resourceId));

export const useCreateBolt = (routeId: string, pointId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    (bolt: Pick<Bolt, "type">) => Api.createBolt(pointId, bolt),
    {
      onSuccess: (data) => {
        queryClient.setQueryData<Bolt[]>(
          ["bolts", { resourceId: pointId }],
          (old) => (old === undefined ? [data] : [...old, data])
        );

        queryClient.setQueryData<Bolt[]>(
          ["bolts", { resourceId: routeId }],
          (old) => (old === undefined ? [data] : [...old, data])
        );
      },
    }
  );
};

export const useUpdateBolt = (boltId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    (updates: Partial<Bolt>) => Api.updateBolt(boltId, updates),
    {
      onSuccess: (data) => {
        queryClient.setQueriesData<Bolt[]>(
          { queryKey: ["bolts"], exact: false },
          (old) =>
            old === undefined
              ? undefined
              : old.map((existingBolt) =>
                  existingBolt.id === boltId ? data : existingBolt
                )
        );
      },
    }
  );
};

export const useDeleteBolt = (boltId: string) => {
  const queryClient = useQueryClient();

  return useMutation(() => Api.deleteBolt(boltId), {
    onSuccess: () => {
      queryClient.setQueriesData<Bolt[]>(
        { queryKey: ["bolts"], exact: false },
        (old) =>
          old === undefined
            ? undefined
            : old.filter((bolt) => bolt.id !== boltId)
      );
    },
  });
};
