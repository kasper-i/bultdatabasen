import { Resource } from "@/models/resource";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../Api";

export const useSector = (sectorId: string) => {
  const queryClient = useQueryClient();

  return useQuery(["sector", { sectorId }], () => Api.getSector(sectorId), {
    onSuccess: ({ id, name, ancestors, counters }) => {
      queryClient.setQueryData<Resource>(
        ["resource", { resourceId: sectorId }],
        {
          id,
          name,
          type: "sector",
          ancestors,
          counters,
        }
      );
    },
  });
};
