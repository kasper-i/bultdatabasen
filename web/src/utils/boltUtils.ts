import { BoltType } from "models/bolt";

export const translateBoltType = (boltType: BoltType) => {
  switch (boltType) {
    case "expansion":
      return "Borrbult";
    case "glue":
      return "Limbult";
  }
};
