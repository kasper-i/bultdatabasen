import { Api } from "@/Api";
import { Model } from "@/models/model";
import { useQuery } from "@tanstack/react-query";

export const useModels = (manufacturerId?: string) =>
  useQuery<Model[]>(
    ["models", { manufacturerId }],
    () => Api.getModels(manufacturerId ?? ""),
    {
      enabled: !!manufacturerId,
      suspense: false,
      cacheTime: 30 * 60 * 1000,
      staleTime: 30 * 60 * 1000,
    }
  );
