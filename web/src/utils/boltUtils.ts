import { BoltType } from "@/models/bolt";

export const translateBoltType = (boltType?: BoltType) => {
  switch (boltType) {
    case "expansion":
      return "Expansionsbult";
    case "glue":
      return "Limbult";
    default:
      return "Bult";
  }
};
