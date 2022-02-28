import { ResourceBase } from "./resource";

export type Crag = Omit<ResourceBase, "name"> & {
  name: string;
  parentId: string;
};
