import { queryClient } from "index";
import { Image } from "models/image";
import { useMutation, useQuery } from "react-query";
import { Api } from "../Api";

export const useImages = (resourceId: string) =>
  useQuery(resourceId != null ? ["images", { resourceId }] : "images", () =>
    Api.getImages(resourceId)
  );

export const useDeleteImage = (parentResourceId: string, imageId: string) =>
  useMutation(() => Api.deleteImage(imageId), {
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<Image[]>(
        ["images", { resourceId: parentResourceId }],
        (old) => old?.filter((image) => image.id !== imageId) ?? []
      );
    },
  });
