import { Image, ImageRotation } from "@/models/image";
import moment from "moment";
import { useDeleteImage, useUpdateImage } from "@/queries/imageQueries";
import React, { ReactElement, useState } from "react";
import DeletePrompt from "./DeletePrompt";
import { ImageView } from "./ImageView";
import Restricted from "./Restricted";
import Button from "./base/Button";

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
  const [deleteRequested, setDeleteRequested] = useState(false);

  const confirmDelete = () => {
    setDeleteRequested(false);
    deleteImage.mutate();
  };

  const timestamp = moment(image.timestamp);
  const year: number = timestamp.year();

  return (
    <ImageView
      image={image}
      targetHeight={TARGET_HEIGHT}
      className="rounded cursor-pointer"
      onClick={() => onClick?.(image.id)}
      version="sm"
    >
      <div className="absolute left-0 top-0 bg-yellow-700 rounded-sm p-1 text-xs -m-1.5 font-bold text-white">
        {year}
      </div>
      {!locked && (
        <Restricted>
          <div className="absolute opacity-70 bg-white h-1/3 w-full bottom-0 left-0 right-0"></div>
          <div className="absolute h-1/3 w-full bottom-0 left-0 right-0 flex justify-center items-center px-2 space-x-1">
            <Button
              color="red"
              circular
              size="mini"
              icon="trash"
              loading={deleteImage.isLoading}
              onClick={(e) => {
                e.stopPropagation();
                setDeleteRequested(true);
              }}
            />
            <Button
              color="blue"
              circular
              size="mini"
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
      {deleteRequested && (
        <DeletePrompt
          onCancel={() => setDeleteRequested(false)}
          onConfirm={() => {
            confirmDelete();
          }}
        />
      )}
    </ImageView>
  );
};

export default ImageThumbnail;
