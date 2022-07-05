import { BoltPosition, BoltType } from "@/models/bolt";

export const translateBoltType = (boltType?: BoltType) => {
  switch (boltType) {
    case "expansion":
      return "Expander";
    case "glue":
      return "Limbult";
    case "piton":
      return "Pitong";
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
