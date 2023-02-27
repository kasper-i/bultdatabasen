import { Api } from "@/Api";
import { useQuery } from "@tanstack/react-query";

export const useResource = (resourceId: string) =>
  useQuery(["resource", { resourceId }], () => Api.getResource(resourceId))

export const useChildren = (resourceId: string) =>
  useQuery(["children", { resourceId }], () => Api.getChildren(resourceId));
