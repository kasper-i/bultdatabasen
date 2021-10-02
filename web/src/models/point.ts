import { Parent } from "./resource";

export interface Point {
  id: string;
  parents: Parent[];
}
