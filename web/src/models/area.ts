import { ResourceBase } from "./resource";

export type Area = Omit<ResourceBase, "name"> & {
  name: string;
  parentId: string;
};
