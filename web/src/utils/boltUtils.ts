import { BoltPosition, BoltType } from "@/models/bolt";

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

export const positionToLabel = (position?: BoltPosition) => {
  switch (position) {
    case "left":
      return "Vänster";
    case "right":
      return "Höger";
    default:
      return "Bultinfo";
  }
};
