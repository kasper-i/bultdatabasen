import { Api } from "@/Api";
import { useQuery } from "@tanstack/react-query";

export const useResource = (resourceId: string) =>
  useQuery(["resource", { resourceId }], () => Api.getResource(resourceId));

export const useLazyResource = (resourceId: string) =>
  useQuery(["resource", { resourceId }], () => Api.getResource(resourceId), {
    enabled: false,
  });

export const useChildren = (resourceId: string) =>
  useQuery(["children", { resourceId }], () => Api.getChildren(resourceId));

export const useMaintainers = (resourceId: string) =>
  useQuery(["maintainers", { resourceId }], () =>
    Api.getMaintainers(resourceId)
  );
