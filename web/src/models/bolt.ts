import { ResourceBase } from "./resource";

export type BoltType = "glue" | "expansion";

export type BoltPosition = "left" | "right";

export type Bolt = ResourceBase & {
  type: BoltType;
  parentId: string;
  position?: BoltPosition;
};
