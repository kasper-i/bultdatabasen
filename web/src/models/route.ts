import { ResourceBase } from "./resource";

export type RouteType = "sport" | "traditional" | "partially_bolted";

export type Route = Omit<ResourceBase, "name"> & {
  name: string;
  altName: string;
  year: number;
  length: number;
  routeType: RouteType;
  externalLink: string;
  parentId: string;
};
