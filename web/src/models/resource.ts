export interface Resource {
  id: string;
  name: string;
  type: string;
  parentId: string;
}

export interface Parent {
  id: string;
  name: string;
  type: string;
}

export interface ResourceWithParents {
  id: string;
  name: string;
  type: string;
  parents: Parent[]
}