import { Bolt } from "./bolt";
import { Parent } from "./resource";

export interface Point {
  id: string;
  parents: Parent[];
  bolts: Bolt[];
  incoming?: Point[];
  outgoing?: Point[];
}
