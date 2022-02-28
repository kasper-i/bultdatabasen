import { Parent, ResourceBase } from "./resource";

export type Point = ResourceBase & {
  parents: Parent[];
  number: number;
};
