import { Api } from "@/Api";
import { Manufacturer } from "@/models/manufacturer";
import { useQuery } from "@tanstack/react-query";

export const useManufacturers = () =>
  useQuery<Manufacturer[]>(["manufacturers"], () => Api.getManufacturers(), {
    cacheTime: 30 * 60 * 1000,
    staleTime: 30 * 60 * 1000,
  });
