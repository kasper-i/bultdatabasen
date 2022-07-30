import { Api } from "@/Api";
import { Material } from "@/models/material";
import { useQuery } from "react-query";

export const useMaterials = () =>
  useQuery<Material[]>(["materials"], () => Api.getMaterials(), {
    cacheTime: 30 * 60 * 1000,
    staleTime: 30 * 60 * 1000,
  });
