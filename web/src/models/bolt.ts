export interface Bolt {
  id: string;
  type: "glue" | "expansion";
  parentId: string;
}
