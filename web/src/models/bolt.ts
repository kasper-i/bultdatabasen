import { ResourceBase } from "./resource";

export type BoltType = "glue" | "expansion";

export type Bolt = ResourceBase & {
  type?: BoltType;
  parentId: string;
};
