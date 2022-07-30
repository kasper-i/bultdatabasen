import { Api } from "@/Api";
import { ResourceCount, ResourceType } from "@/models/resource";
import { useQuery } from "@tanstack/react-query";

export const useResource = (resourceId: string) =>
  useQuery(["resource", { resourceId }], () => Api.getResource(resourceId));

export const useChildren = (resourceId: string) =>
  useQuery(["children", { resourceId }], () => Api.getChildren(resourceId));

export const useCounts = (resourceId: string, enabled = true) =>
  useQuery(["counts", { resourceId }], () => Api.getCounts(resourceId), {
    select: (data: ResourceCount[]) => {
      const map: Record<ResourceType, number> = {
        root: 0,
        area: 0,
        crag: 0,
        sector: 0,
        route: 0,
        bolt: 0,
        point: 0,
        image: 0,
        comment: 0,
        task: 0,
      };

      for (const count of data) {
        map[count.type] = count.count;
      }

      return map;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
