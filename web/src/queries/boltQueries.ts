import { Bolt } from "models/bolt";
import { useMutation, useQuery } from "react-query";
import { Api } from "../Api";
import { queryClient } from "../index";

export const useBolts = (resourceId: string) =>
  useQuery(["bolts", { resourceId }], () => Api.getBolts(resourceId));

export const useCreateBolt = (routeId: string, pointId: string) =>
  useMutation((bolt: Pick<Bolt, "type">) => Api.createBolt(pointId, bolt), {
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<Bolt[]>(
        ["bolts", { resourceId: pointId }],
        (old) => (old !== undefined ? [...old, data] : [])
      );

      queryClient.setQueryData<Bolt[]>(
        ["bolts", { resourceId: routeId }],
        (old) => (old !== undefined ? [...old, data] : [])
      );
    },
  });

export const useDeleteBolt = (
  routeId: string,
  pointId: string,
  boltId: string
) =>
  useMutation(() => Api.deleteBolt(boltId), {
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<Bolt[]>(
        ["bolts", { resourceId: pointId }],
        (old) =>
          old !== undefined ? old.filter((bolt) => bolt.id !== boltId) : []
      );

      queryClient.setQueryData<Bolt[]>(
        ["bolts", { resourceId: routeId }],
        (old) =>
          old !== undefined ? old.filter((bolt) => bolt.id !== boltId) : []
      );
    },
  });
