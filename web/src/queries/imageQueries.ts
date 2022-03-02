import { queryClient } from "@/index";
import { Image } from "@/models/image";
import { useMutation, useQuery } from "react-query";
import { Api } from "../Api";

export const useImages = (resourceId: string) =>
  useQuery(resourceId != null ? ["images", { resourceId }] : "images", () =>
    Api.getImages(resourceId)
  );

export const useDeleteImage = (parentResourceId: string, imageId: string) =>
  useMutation(() => Api.deleteImage(imageId), {
    onSuccess: () => {
      queryClient.setQueryData<Image[]>(
        ["images", { resourceId: parentResourceId }],
        (old) => old?.filter((image) => image.id !== imageId) ?? []
      );
    },
  });

export const useUpdateImage = (parentResourceId: string, imageId: string) =>
  useMutation(
    (patch: Pick<Image, "rotation">) => Api.updateImage(imageId, patch),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData<Image[]>(
          ["images", { resourceId: parentResourceId }],
          (old) =>
            old?.map((image) =>
              image.id === imageId ? { ...image, ...variables } : image
            ) ?? []
        );
      },
    }
  );
