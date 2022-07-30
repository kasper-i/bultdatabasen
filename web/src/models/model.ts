import { BoltType, DiameterUnit } from "./bolt";

export interface Model {
  id: string;
  name: string;
  manufacturerId: string;
  type?: BoltType;
  materialId?: string;
  diameter?: number;
  diameterUnit?: DiameterUnit;
}
