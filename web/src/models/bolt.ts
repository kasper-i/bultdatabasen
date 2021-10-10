export type BoltType = "glue" | "expansion";

export interface Bolt {
  id: string;
  type?: BoltType;
  parentId: string;
}
