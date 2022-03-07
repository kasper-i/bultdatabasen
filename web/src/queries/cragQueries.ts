import { Resource } from "@/models/resource";
import { useQuery, useQueryClient } from "react-query";
import { Api } from "../Api";

export const useCrag = (cragId: string) => {
  const queryClient = useQueryClient();

  return useQuery(["crag", { cragId }], () => Api.getCrag(cragId), {
    onSuccess: ({ id, name, parentId, ancestors }) => {
      queryClient.setQueryData<Resource>(["resource", { resourceId: cragId }], {
        id,
        name,
        type: "crag",
        parentId,
        ancestors,
      });
    },
  });
};
