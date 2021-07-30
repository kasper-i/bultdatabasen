import { Bolt } from "models/bolt";
import { Point } from "models/point";
import { useMutation, useQuery } from "react-query";
import { Api } from "../Api";
import { queryClient } from "../index";

export const useBolts = (resourceId: string) =>
  useQuery(["bolts", { resourceId }], () => Api.getBolts(resourceId));

export const useCreateBolt = (routeId: string) =>
  useMutation(
    ({ pointId, bolt }: { pointId: string; bolt: Pick<Bolt, "type"> }) =>
      Api.createBolt(pointId, bolt),
    {
      onSuccess: (data, variables, context) => {
        queryClient.setQueryData<Point[]>(
          ["points", { resourceId: routeId }],
          (old) =>
            old !== undefined
              ? old.map((point) => {
                  if (point.id === variables.pointId) {
                    return { ...point, bolts: [...point.bolts, data] };
                  } else {
                    return point;
                  }
                })
              : []
        );

        queryClient.setQueryData<Bolt[]>(
          ["bolts", { resourceId: routeId }],
          (old) => (old !== undefined ? [...old, data] : [])
        );
      },
    }
  );

export const useDeleteBolt = (
  routeId: string,
  pointId: string,
  boltId: string
) =>
  useMutation(() => Api.deleteBolt(boltId), {
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<Point[]>(
        ["points", { resourceId: routeId }],
        (old) =>
          old !== undefined
            ? old.map((point) => {
                if (point.id === pointId) {
                  return {
                    ...point,
                    bolts: point.bolts.filter((bolt) => bolt.id !== boltId),
                  };
                } else {
                  return point;
                }
              })
            : []
      );

      queryClient.setQueryData<Bolt[]>(
        ["bolts", { resourceId: routeId }],
        (old) =>
          old !== undefined ? old.filter((bolt) => bolt.id !== boltId) : []
      );
    },
  });
