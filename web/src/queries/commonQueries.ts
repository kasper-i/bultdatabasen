import { Api } from "Api";
import { useQuery } from "react-query";

export const useAncestors = (resourceId: string) =>
  useQuery(["ancestors", { resourceId }], () => Api.getAncestors(resourceId));

export const useChildren = (resourceId: string) =>
  useQuery(["children", { resourceId }], () => Api.getChildren(resourceId));
