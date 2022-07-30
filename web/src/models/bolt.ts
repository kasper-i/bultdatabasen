import { ResourceBase } from "./resource";

export type BoltType = "glue" | "expansion" | "piton";

export type BoltPosition = "left" | "right";

export type DiameterUnit = "mm" | "inch";

export type Bolt = ResourceBase & {
  type: BoltType;
  parentId: string;
  position?: BoltPosition;
  installed?: string;
  dismantled?: string;
  manufacturerId?: string;
  manufacturer?: string;
  modelId?: string;
  model?: string;
  material?: string;
  materialId?: string;
  diameter?: number;
  diameterUnit?: DiameterUnit;
};
