import { useQuery } from "react-query";
import { Api } from "../Api";

export const useBolts = (resourceId: string) =>
  useQuery(["bolts", { resourceId }], () => Api.getBolts(resourceId));
