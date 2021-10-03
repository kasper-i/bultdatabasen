import clsx from "clsx";
import configData from "config.json";
import { Image } from "models/image";
import { useDeleteImage } from "queries/imageQueries";
import React, { ReactElement, useState } from "react";
import { Button } from "semantic-ui-react";
import DeletePrompt from "./DeletePrompt";
import Restricted from "./Restricted";

interface Props {
  pointId: string;
  image: Image;
  locked: boolean;
  onClick?: (imageId: string) => void;
}

const ImagePreview = ({
  pointId,
  image,
  locked,
  onClick,
}: Props): ReactElement => {
  const deleteImage = useDeleteImage(pointId, image.id);
  const [deleteRequested, setDeleteRequested] = useState(false);

  const confirmDelete = () => {
    setDeleteRequested(false);
    deleteImage.mutate();
  };

  return (
    <div
      style={
        image.width < image.height
          ? { width: 90, height: 120 }
          : { width: 160, height: 120 }
      }
      className="cursor-pointer"
    >
      <div
        className={clsx(
          image.width < image.height ? "max-h-full" : "max-w-full",
          "relative"
        )}
      >
        <img
          className="rounded"
          onClick={() => onClick?.(image.id)}
          src={`${configData.API_URL}/images/${image.id}/xs`}
          alt=""
        />
        {!locked && (
          <Restricted>
            <div className="absolute z-10 opacity-70 bg-white h-1/3 w-full bottom-0 left-0 right-0"></div>
            <div className="absolute z-20 h-1/3 w-full bottom-0 left-0 right-0 flex justify-center items-center px-2 space-x-1">
              <Button
                color="red"
                circular
                size="mini"
                icon="trash"
                loading={deleteImage.isLoading}
                onClick={() => setDeleteRequested(true)}
              />
              <Button
                color="blue"
                circular
                size="mini"
                icon="redo"
                onClick={() => {}}
                disabled
              />
            </div>
          </Restricted>
        )}
      </div>
      {deleteRequested && (
        <DeletePrompt
          onCancel={() => setDeleteRequested(false)}
          onConfirm={() => {
            confirmDelete();
          }}
        />
      )}
    </div>
  );
};

export default ImagePreview;
