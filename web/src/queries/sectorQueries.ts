import { useQuery } from "react-query";
import { Api } from "../Api";

export const useSector = (sectorId: string) =>
  useQuery(["sector", { sectorId }], () => Api.getSector(sectorId));
