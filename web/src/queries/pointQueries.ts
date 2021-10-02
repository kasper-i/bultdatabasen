import { queryClient } from "index";
import { useMutation, useQuery } from "react-query";
import { Api, InsertPosition } from "../Api";

export const usePoints = (routeId: string) =>
  useQuery(["points", { resourceId: routeId }], () => Api.getPoints(routeId));

export const useAttachPoint = (routeId: string) =>
  useMutation(
    ({ pointId, position }: { pointId?: string; position?: InsertPosition }) =>
      Api.addPoint(routeId, pointId, position),
    {
      onSuccess: async (data, variables, context) => {
        queryClient.refetchQueries(["points", { resourceId: routeId }]);
      },
    }
  );

export const useDetachPoint = (routeId: string, pointId: string) =>
  useMutation(() => Api.detachPoint(routeId, pointId), {
    onSuccess: async (data, variables, context) => {
      queryClient.refetchQueries(["points", { resourceId: routeId }]);
    },
  });
