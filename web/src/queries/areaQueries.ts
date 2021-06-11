import { useQuery } from "react-query";
import { Api } from "../Api";

export const useAreas = (areaId?: string) =>
  useQuery(areaId != null ? ["areas", { areaId }] : "areas", () =>
    Api.getAreas(areaId)
  );

export const useArea = (areaId: string) =>
  useQuery(["area", { areaId }], () => Api.getArea(areaId));
