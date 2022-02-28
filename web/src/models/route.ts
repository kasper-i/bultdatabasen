import { ResourceBase } from "./resource";

export type Route = Omit<ResourceBase, "name"> & {
  name: string;
  altName: string;
  year: number;
  length: number;
  routeType: string;
  externalLink: string;
  parentId: string;
};
