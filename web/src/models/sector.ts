import { ResourceBase } from "./resource";

export type Sector = Omit<ResourceBase, "name"> & {
  name: string;
  parentId: string;
};
