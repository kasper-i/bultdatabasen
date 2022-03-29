import { Image, ImageRotation } from "@/models/image";
import { useDeleteImage, useUpdateImage } from "@/queries/imageQueries";
import moment from "moment";
import React, { ReactElement } from "react";
import IconButton from "./atoms/IconButton";
import { ImageView } from "./ImageView";
import ConfirmedDeleteButton from "./molecules/ConfirmedDeleteButton";
import Pill from "./Pill";
import Restricted from "./Restricted";

interface Props {
  pointId: string;
  image: Image;
  locked: boolean;
  onClick?: (imageId: string) => void;
}

const TARGET_HEIGHT = 120;

const ImageThumbnail = ({
  pointId,
  image,
  locked,
  onClick,
}: Props): ReactElement => {
  const deleteImage = useDeleteImage(pointId, image.id);
  const updateImage = useUpdateImage(pointId, image.id);

  const timestamp = moment(image.timestamp);
  const year: number = timestamp.year();

  return (
    <ImageView
      image={image}
      targetHeight={TARGET_HEIGHT}
      className="rounded-sm shadow-sm cursor-pointer"
      onClick={() => onClick?.(image.id)}
      version="sm"
    >
      <div className="absolute z-10 left-0 top-0 bg-gray-300 rounded-sm p-1 text-xs -m-1.5 font-bold text-gray-800">
        {year}
      </div>
      {!locked && (
        <Restricted>
          <div className="absolute opacity-70 bg-white h-full w-full bottom-0 left-0 right-0"></div>
          <div className="absolute h-full w-full bottom-0 left-0 right-0 flex flex-col justify-center items-center px-2 gap-1.5">
            <ConfirmedDeleteButton
              circular
              mutation={deleteImage}
              target="bilden"
            />
            <IconButton
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
