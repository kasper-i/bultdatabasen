import { useQuery } from "react-query";
import { Api } from "../Api";

export const useImages = (resourceId: string) =>
  useQuery(resourceId != null ? ["images", { resourceId }] : "images", () =>
    Api.getImages(resourceId)
  );
  