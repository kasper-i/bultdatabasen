import { useQuery } from "react-query";
import { Api } from "../Api";

export const useCrag = (cragId: string) =>
  useQuery(["crag", { cragId }], () => Api.getCrag(cragId));
