export type ResourceType =
  | "root"
  | "area"
  | "crag"
  | "sector"
  | "route"
  | "point"
  | "bolt"
  | "comment"
  | "image"
  | "task";

export interface Resource {
  id: string;
  name?: string;
  type: ResourceType;
  parentId?: string;
}

export interface Parent {
  id: string;
  name: string;
  type: ResourceType;
}

export interface ResourceWithParents {
  id: string;
  name: string;
  type: ResourceType;
  parents: Parent[];
}

export interface ResourceCount {
  type: ResourceType;
  count: number;
}
