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

export interface ResourceBase {
  id: string;
  name?: string;
  ancestors?: Omit<Resource, "ancestors">[];
}

export type Resource = ResourceBase & {
  type: ResourceType;
  parentId?: string;
};

export interface Parent {
  id: string;
  name: string;
  type: ResourceType;
}

export interface SearchResult {
  id: string;
  name: string;
  type: ResourceType;
  parents: Parent[];
}

export interface ResourceCount {
  type: ResourceType;
  count: number;
}
