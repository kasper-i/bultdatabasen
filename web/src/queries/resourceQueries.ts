import { Api } from "@/Api";
import { rootNodeId } from "@/constants";
import { Resource } from "@/models/resource";
import { useQuery } from "@tanstack/react-query";

export const useResource = (resourceId: string) =>
  useQuery(["resource", { resourceId }], () => Promise.resolve<Resource>({ id: rootNodeId, type: 'root' }))

export const useChildren = (resourceId: string) =>
  useQuery(["children", { resourceId }], () => Api.getChildren(resourceId));
