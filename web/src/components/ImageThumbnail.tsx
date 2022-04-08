import { Image, ImageRotation } from "@/models/image";
import { useDeleteImage, useUpdateImage } from "@/queries/imageQueries";
import React, { ReactElement } from "react";
import IconButton from "./atoms/IconButton";
import { ImageView } from "./ImageView";
import ConfirmedDeleteButton from "./molecules/ConfirmedDeleteButton";
import Restricted from "./Restricted";

interface Props {
  pointId: string;
  image: Image;
  locked: boolean;
  onClick?: (imageId: string) => void;
}

const TARGET_HEIGHT = 80;

const ImageThumbnail = ({
  pointId,
  image,
  locked,
  onClick,
}: Props): ReactElement => {
  const deleteImage = useDeleteImage(pointId, image.id);
  const updateImage = useUpdateImage(pointId, image.id);

  return (
    <ImageView
      image={image}
      targetHeight={TARGET_HEIGHT}
      className="rounded-sm cursor-pointer ring-2 ring-gray-200 hover:ring-2 hover:ring-primary-500 ring-offset-2"
      onClick={() => onClick?.(image.id)}
      version="sm"
    >
      {!locked && (
        <Restricted>
          <div className="absolute opacity-60 bg-white h-full w-full bottom-0 left-0 right-0"></div>
          <div className="absolute h-full w-full bottom-0 left-0 right-0 flex flex-col justify-center items-center px-2 gap-2">
            <ConfirmedDeleteButton
              circular
              mutation={deleteImage}
              target="bilden"
              tiny
            />
            <IconButton
              tiny
              color="primary"
              circular
              icon="redo"
              onClick={(e) => {
                e.stopPropagation();
                updateImage.mutate({
                  rotation: (((image.rotation ?? 0) + 90) %
                    360) as ImageRotation,
                });
              }}
              loading={updateImage.isLoading}
            />
          </div>
        </Restricted>
      )}
    </ImageView>
  );
};

export default ImageThumbnail;
