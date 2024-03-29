import { Resource } from "@/models/resource";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../Api";

export const useAreas = (areaId?: string) =>
  useQuery(areaId !== undefined ? ["areas", { areaId }] : ["areas"], () =>
    Api.getAreas(areaId)
  );

export const useArea = (areaId: string) => {
  const queryClient = useQueryClient();

  return useQuery(["area", { areaId }], () => Api.getArea(areaId), {
    onSuccess: ({ id, name, ancestors, counters }) => {
      queryClient.setQueryData<Resource>(["resource", { resourceId: areaId }], {
        id,
        name,
        type: "area",
        ancestors,
        counters,
      });
    },
  });
};
