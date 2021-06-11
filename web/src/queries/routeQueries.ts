import { useQuery } from "react-query";
import { Api } from "../Api";

export const useRoute = (routeId: string) =>
  useQuery(["route", { routeId }], () => Api.getRoute(routeId));
