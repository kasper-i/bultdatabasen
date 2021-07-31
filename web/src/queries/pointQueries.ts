import { queryClient } from "index";
import { useMutation, useQuery } from "react-query";
import { Api } from "../Api";

export const usePoints = (routeId: string) =>
  useQuery(["points", { resourceId: routeId }], () => Api.getPoints(routeId));

export const useCreatePoint = (routeId: string) =>
  useMutation(
    (_?: { direction: "outgoing" | "incoming"; linkedPointId: string }) =>
      Api.createPoint(routeId),
    {
      onSuccess: async (data, variables, context) => {
        if (variables !== undefined) {
          if (variables.direction === "outgoing") {
            await Api.createConnection(variables.linkedPointId, data.id);
          } else if (variables.direction === "incoming") {
            await Api.createConnection(data.id, variables.linkedPointId);
          }
        }

        queryClient.refetchQueries(["points", { resourceId: routeId }]);
      },
    }
  );

export const useDeletePoint = (routeId: string, pointId: string) =>
  useMutation(() => Api.deletePoint(pointId), {
    onSuccess: async (data, variables, context) => {
      queryClient.refetchQueries(["points", { resourceId: routeId }]);
    },
  });
