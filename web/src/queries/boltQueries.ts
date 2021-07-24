import { Bolt } from "models/bolt";
import { useMutation, useQuery } from "react-query";
import { Api } from "../Api";
import { queryClient } from "../index";

export const useBolts = (resourceId: string) =>
  useQuery(["bolts", { resourceId }], () => Api.getBolts(resourceId));

export const useCreateBolt = (routeId: string) =>
  useMutation(({pointId, bolt}: {pointId: string, bolt: Pick<Bolt, "type">}) => Api.createBolt(pointId, bolt), {
    onSuccess: (data, variables, context) => {
      queryClient.refetchQueries(["points", { resourceId: routeId }]);
      queryClient.refetchQueries(["bolts", { resourceId: routeId }]);
    },
  });
