import { Image } from "@/models/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../Api";

export const useImages = (resourceId: string) =>
  useQuery(["images", { resourceId }], () => Api.getImages(resourceId));

export const useDeleteImage = (parentResourceId: string, imageId: string) => {
  const queryClient = useQueryClient();

  return useMutation(() => Api.deleteImage(imageId), {
    onSuccess: () => {
      queryClient.setQueryData<Image[]>(
        ["images", { resourceId: parentResourceId }],
        (old) => old?.filter((image) => image.id !== imageId) ?? []
      );
    },
  });
};

export const useUpdateImage = (parentResourceId: string, imageId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
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
};
